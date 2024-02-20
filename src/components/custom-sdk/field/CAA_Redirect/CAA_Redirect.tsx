import { Link } from '@pega/cosmos-react-core';
import React, { useState, useEffect } from 'react';

const Redirect = () => {
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
          .then(response => {
            if (!response || !response.data) {
              throw new Error('Failed to fetch data from Pega.');
            }
            let respData = response.defaultResponse_GET;
            respData = JSON.parse(respData);
            const redirectUrl = respData._links.session;
            if (redirectUrl === '') {
              throw new Error('Empty URL received from Pega data page');
            }
            const url = redirectUrl;
            setRedirectUrl(url);
            setLoading(false);
          });
      } catch (error) {
        console.error('Error fetching data from Pega:', error);
        setLoading(false);
      }
    };

    if (caseInKey !== null) {
      fetchData();
    }
  }, []);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <Link href={redirectUrl} variant='link' target='_blank'>
            MDTP Redirect
          </Link>
        </div>
      )}
    </div>
  );
};

export default Redirect;
