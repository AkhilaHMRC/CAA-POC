document
  .getElementById("pegaForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Make POST request to Pega endpoint
    if (username === "CAAServiceUser" && password === "CAA@2024") {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "http://stg-2.pegacloud.net/prweb/api/v1/cases", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader(
        "Authorization",
        "Basic " + btoa(username + ":" + password)
      );

      xhr.onload = function () {
        if (xhr.status === 200) {
          // Parse the response
          var response = JSON.parse(xhr.responseText);
          var caseId = response.ID;

          // Display caseId on the screen
          document.getElementById("result").innerHTML = "Case ID: " + caseId;
        } else {
          // Handle errors
          document.getElementById("result").innerHTML =
            "Error: " + xhr.statusText;
        }
      };

      xhr.onerror = function () {
        document.getElementById("result").innerHTML = "Network error";
      };

      var requestData = JSON.stringify({
        caseTypeID: "HMRC-Debt-Work-AffordAssess",
        processID: "",
        parentCaseID: "",
        content: {},
      });

      xhr.send(requestData);
    } else {
      // Display an error message for invalid credentials
      alert("Invalid credentials");
    }
  });
