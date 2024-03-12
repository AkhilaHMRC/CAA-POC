import { Link } from '@pega/cosmos-react-core';
import React, { useState, useEffect } from 'react';

import StyledHmrcOdxMdtpRedirectWrapper from './styles';

export default function MDTPRedirect() {
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const caseInKey = sessionStorage.getItem('caseID');
    const fetchData = async () => {
      try {
        await PCore.getDataPageUtils()
          .getPageDataAsync('D_WebSessionAPI', 'app', {
            CaseInsKey: caseInKey
          })
          // @ts-ignore
          .then(response => {
            if (!response || !response.defaultResponse_GET) {
              throw new Error('Failed to fetch data from Pega.');
            }
            let respData = response.defaultResponse_GET;
            respData = JSON.parse(respData);
            const webSessionUrl = respData._links.session;
            if (webSessionUrl === '') {
              throw new Error('Empty URL received from Pega data page');
            }
            setRedirectUrl(webSessionUrl);
            setLoading(false);
          });
      } catch (error) {
        throw new Error('Error fetching data from Pega:');
        setLoading(false);
      }
    };

    if (caseInKey !== null) {
      fetchData();
    }
  }, []);

  return (
    <StyledHmrcOdxMdtpRedirectWrapper>
      {loading ? (
        <>Loading...</>
      ) : (
        <Link href={redirectUrl} variant='link'>
          Go back to MDTP
        </Link>
      )}
    </StyledHmrcOdxMdtpRedirectWrapper>
  );
}
