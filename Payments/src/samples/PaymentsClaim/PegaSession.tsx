import React, { useEffect, useState } from 'react';

const PegaSession = () => {
  const [idToken, setIdToken] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);

  useEffect(() => {
    // Step 1: Make a GET call to Pega data page and get the id token
    const getPegaIdToken = async () => {
      try {
        const response = await fetch(
          'https://hmrc-adviserui-stg2.pegacloud.net/prweb/D_MDTPWebAPI_Get'
        );
        const data = await response.json();
        const tokenId = data.idToken; // Replace with the actual key in your Pega response
        setIdToken(tokenId);

        // Step 2: Make a GET call to Web Session API using the id token
        const webSessionResponse = await fetch(
          'https://test-api.service.hmrc.gov.uk/web-session/sso-api/web-session?continueUrl=/tax-credits/doo/dar',
          {
            headers: {
              Authorization: `Bearer ${tokenId}`
            },
            redirect: 'follow' // Follow redirects automatically
          }
        );

        const webSessionData = await webSessionResponse.json();
        const webSessionRedirectUrl = webSessionData.redirectUrl; // Replace with the actual key in your Web Session API response
        setRedirectUrl(webSessionRedirectUrl);

        // Step 3: Pass the redirect URL to MDTP session
        await fetch('http://mdtp-session-endpoint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            redirectUrl: webSessionRedirectUrl
          })
        });
      } catch (error) {
        console.error('Error:', error);
      }
    };

    getPegaIdToken();
  }, []);

  return (
    <div>
      <p>ID Token: {idToken}</p>
      <p>Redirect URL: {redirectUrl}</p>
    </div>
  );
};

export default PegaSession;
