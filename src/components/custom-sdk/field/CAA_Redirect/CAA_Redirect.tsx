import React, { useState, useEffect } from 'react';

const Redirect = () => {
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const caseId = sessionStorage.getItem('caseId');

    const fetchData = async () => {
      try {
        const response = await PCore.getDataPageUtils().getDataAsync('D_WebSessionAPI', 'root', {
          CaseInsKey: caseId
        });
        if (!response || !response.data) {
          throw new Error('Failed to fetch data from Pega.');
        }
        const url = response.data.url;
        setRedirectUrl(url);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data from Pega:', error);
        setLoading(false);
      }
    };

    if (caseId !== null) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, [redirectUrl]);

  return <div>{loading ? <div>Loading...</div> : <div>Loaded..!</div>}</div>;
};

export default Redirect;
