import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppHeader from '../../components/AppComponents/AppHeader';
import AppFooter from '../../components/AppComponents/AppFooter';
import { compareSdkPCoreVersions } from '@pega/react-sdk-components/lib/components/helpers/versionHelpers';
import { getSdkConfig } from '@pega/react-sdk-components/lib/components/helpers/config_access';
import { getSdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import localSdkComponentMap from '../../../sdk-local-component-map';
import {
  loginIfNecessary,
  sdkSetAuthHeader
} from '@pega/react-sdk-components/lib/components/helpers/authManager';
import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import { render } from 'react-dom';
import toggleNotificationProcess from '../../components/helpers/toggleNotificationProcess';

declare const myLoadMashup: any;

interface IPaymentsClaimProps {
  assignmentId: string;
  caseId: string;
}

export default function PaymentsClaim(mainProps: IPaymentsClaimProps) {
  const [bShowPega, setShowPega] = useState(false);
  const [assignmentPConn, setAssignmentPConn] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const assignment = mainProps.assignmentId;
    const caseInKey = mainProps.caseId;
    if (assignment !== null && caseInKey !== null) {
      sessionStorage.setItem('assignmentID', assignment);
      sessionStorage.setItem('caseID', caseInKey);
    }
  }, []);

  function displayPega() {
    setShowPega(true);
  }

  function openAssignment() {
    displayPega();
    const assignmentID = sessionStorage.getItem('assignmentID');
    if (assignmentID) {
      PCore.getMashupApi().openAssignment(assignmentID);
    }
  }

  // from react_root.js with some modifications
  function RootComponent(pegaConnectProps) {
    const PegaConnectObj = createPConnectComponent();
    const thePConnObj = <PegaConnectObj {...pegaConnectProps} />;

    // NOTE: For Embedded mode, we add in displayOnlyFA and isMashup to our React context
    // so the values are available to any component that may need it.
    //   const theComp = (
    //     <StoreContext.Provider
    //       value={{ store: PCore.getStore(), displayOnlyFA: true, isMashup: true }}
    //     >
    //       {thePConnObj}
    //     </StoreContext.Provider>
    //   );

    //   return theComp;
    // }
    const theComp = (
      <StoreContext.Provider
        value={{
          store: PCore.getStore(),
          displayOnlyFA: true,
          isMashup: true,
          setAssignmentPConnect: setAssignmentPConn
        }}
      >
        {thePConnObj}
      </StoreContext.Provider>
    );

    return theComp;
  }

  /**
   * Callback from onPCoreReady that's called once the top-level render object
   * is ready to be rendered
   * @param inRenderObj the initial, top-level PConnect object to render
   */
  function initialRender(inRenderObj) {
    // loadMashup does its own thing so we don't need to do much/anything here
    // modified from react_root.js render
    const {
      props,
      domContainerID = null,
      componentName,
      portalTarget,
      styleSheetTarget
    } = inRenderObj;
    let target: any = null;

    if (domContainerID !== null) {
      target = document.getElementById(domContainerID);
    } else if (portalTarget !== null) {
      target = portalTarget;
    }

    // Note: RootComponent is just a function (declared below)
    const Component: any = RootComponent;

    if (componentName) {
      Component.displayName = componentName;
    }

    const theComponent = (
      <Component {...props} portalTarget={portalTarget} styleSheetTarget={styleSheetTarget} />
    );

    // Initial render of component passed in (which should be a RootContainer)
    render(<React.Fragment>{theComponent}</React.Fragment>, target);
  }

  function establishPCoreSubscriptions() {
    PCore.getPubSubUtils().subscribe(
      'assignmentFinished',
      () => {
        setShowPega(false);
      },
      'assignmentFinished'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
      () => {
        setShowPega(false);
      },
      'cancelAssignment'
    );
  }

  /**
   * kick off the application's portal that we're trying to serve up
   */
  function startMashup() {
    // NOTE: When loadMashup is complete, this will be called.
    PCore.onPCoreReady(renderObj => {
      // eslint-disable-next-line no-console
      console.log(`PCore ready!`);
      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();

      establishPCoreSubscriptions();

      // Initialize the SdkComponentMap (local and pega-provided)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      getSdkComponentMap(localSdkComponentMap).then((theComponentMap: any) => {
        // Don't call initialRender until SdkComponentMap is fully initialized
        initialRender(renderObj);
      });
    });

    // load the Mashup and handle the onPCoreEntry response that establishes the
    //  top level Pega root element (likely a RootContainer)

    myLoadMashup('pega-root', false); // this is defined in bootstrap shell that's been loaded already
  }

  // One time (initialization) subscriptions and related unsubscribe
  useEffect(() => {
    getSdkConfig().then((sdkConfig: any) => {
      const sdkConfigAuth = sdkConfig.authConfig;

      if (!sdkConfigAuth.mashupClientId && sdkConfigAuth.customAuthType === 'Basic') {
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(
          `${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}`
        );
        sdkSetAuthHeader(`Basic ${sB64}`);
      }

      if (!sdkConfigAuth.mashupClientId && sdkConfigAuth.customAuthType === 'BasicTO') {
        const now = new Date();
        const expTime = new Date(now.getTime() + 5 * 60 * 1000);
        let sISOTime = `${expTime.toISOString().split('.')[0]}Z`;
        const regex = /[-:]/g;
        sISOTime = sISOTime.replace(regex, '');
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(
          `${sdkConfigAuth.mashupUserIdentifier}:${window.atob(
            sdkConfigAuth.mashupPassword
          )}:${sISOTime}`
        );
        sdkSetAuthHeader(`Basic ${sB64}`);
      }

      document.addEventListener('SdkConstellationReady', () => {
        // start the portal
        startMashup();
        openAssignment();
      });

      // Login if needed, without doing an initial main window redirect
      loginIfNecessary({ appName: 'embedded', mainRedirect: true });
    });

    // Subscriptions can't be done until onPCoreReady.
    //  So we subscribe there. But unsubscribe when this
    //  component is unmounted (in function returned from this effect)

    return function cleanupSubscriptions() {
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
        'cancelAssignment'
      );

      PCore?.getPubSubUtils().unsubscribe('assignmentFinished', 'assignmentFinished');
    };
  }, []);

  return (
    <>
      {/* <AppHeader
        handleSignout={() => {}}
        appname={t('AFFORDABILITY_ASSESSMENT_CASE')}
        hasLanguageToggle
        isPegaApp={bShowPega}
      /> */}
      <AppHeader
        handleSignout={() => {}}
        appname={t('AFFORDABILITY_ASSESSMENT_CASE')}
        hasLanguageToggle
        languageToggleCallback={toggleNotificationProcess(
          { en: 'SwitchLanguageToEnglish', cy: 'SwitchLanguageToWelsh' },
          assignmentPConn
        )}
      />
      <div className='govuk-width-container'>
        <>
          <div id='pega-part-of-page'>
            <div id='pega-root'></div>
          </div>
          <p>Affortability Case</p>
        </>
      </div>
      <AppFooter />
    </>
  );
}
