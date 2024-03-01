document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('pegaForm').addEventListener('submit', function (event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Make POST request to Pega endpoint
    if (username === 'CAAServiceUser' && password === 'CAA@2024') {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://hmrc-adviserui-stg2.pegacloud.net/prweb/api/v1/cases', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));

      xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 201) {
          // Parse the response
          var response = JSON.parse(xhr.responseText);

          // Check if the 'ID' field exists in the response
          if (response.hasOwnProperty('ID')) {
            // Extract the case ID
            var caseId = response.ID;
            var assignmentId = response.nextAssignmentID;

            // Display caseId on the screen
            document.getElementById('result').innerHTML =
              'Case ID: ' + caseId + '\n' + 'Assignment ID: ' + assignmentId;

            setTimeout(function () {
              window.location.href =
                'http://localhost:3502/affordability?caseId=' + caseId + '&assignmentId=' + assignmentId;
            }, 1000); // 4000 milliseconds = 6 seconds
          } else {
            // Display an error message if 'ID' field is missing in the response
            document.getElementById('result').innerHTML = "Error: 'ID' field missing in response";
          }
        } else {
          // Handle errors
          document.getElementById('result').innerHTML = 'Error: ' + xhr.statusText;
        }
      };

      var requestData = JSON.stringify({
        caseTypeID: 'HMRC-Debt-Work-AffordAssess',
        processID: '',
        parentCaseID: '',
        content: {}
      });

      xhr.send(requestData);
    } else {
      // Display an error message for invalid credentials
      alert('Invalid credentials');
    }
  });
});
