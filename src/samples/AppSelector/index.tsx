import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import i18n from 'i18next';
// import EmbeddedTopLevel from "../Embedded/EmbeddedTopLevel";
import ChildBenefitsClaim from '../ChildBenefitsClaim/index';
import CookiePage from '../ChildBenefitsClaim/cookiePage/index';
import Accessibility from '../ChildBenefitsClaim/AccessibilityPage';
import UnAuthChildBenefitsClaim from '../UnAuthChildBenefitsClaim';
import PaymentsClaim from '../PaymentsClaim';

const AppSelector = () => {
  i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      lng: sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en',
      backend: {
        /* translation file path */
        loadPath: `assets/i18n/{{lng}}.json`
      },
      fallbackLng: 'en',
      debug: false,
      returnNull: false,
      react: {
        useSuspense: false
      }
    });
  const queryParams = new URLSearchParams(window.location.search);
  const caseProps = {
    assignmentId: queryParams.get('assignmentId'),
    caseId: queryParams.get('caseId')
  };

  return (
    <Switch>
      <Route exact path='/' component={ChildBenefitsClaim} />
      <Route path='/affordability' render={() => <PaymentsClaim {...caseProps} />} />
      <Route exact path='/ua' component={UnAuthChildBenefitsClaim} />
      <Route path='/cookies' component={CookiePage} />
      <Route path='/accessibility' component={Accessibility} />
    </Switch>
  );
};

export default AppSelector;
