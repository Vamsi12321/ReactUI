
import React, { useState, useEffect } from "react";
import {Device} from "@twilio/voice-sdk"
import "./App.css";
import proxzar from "./assets/proxzar.png";

function App() {
  const [token, setToken] = useState("");
  const [tokenExpTime, setTokenExpTime] = useState("");
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false); // State for loading animation
  const [visibleFaqIndex, setVisibleFaqIndex] = useState(null); // State for tracking visible FAQ



  const proxzarGetAccessTokenurl = "https://pf.proxzar.ai/ekgwebforms/api/Proxzar/Members/AccessTokenForApp?";
  const proxzarGetResponsesUrl = "https://pf.proxzar.ai/ekgwebforms/api/Proxzar/Members/GetResponses";
  const generateQueryFromResponse = "https://pf.proxzar.ai/EkgWebForms/api/Proxzar/Members/GenerateQuestion";
  const getSimilarQuestionsUrl = "https://pf.proxzar.ai/EkgWebForms/api/Proxzar/Members/GetSimilarQuestions";
  // const proxzarGetTwilioCapabilityTokenUrl = "https://pf.proxzar.ai/EkgWebForms/api/Proxzar/Members/TwilioCapabilityToken";
  const proxzarToken = " https://pf.proxzar.ai/EkgWebForms/api/Proxzar/Members/AccessToken"

  
  const divProxzarSbProxId = "NIPRPRDSVC01";

  // Updated function for token validation
  const isTokenValid = () => {
    const _token = sessionStorage.getItem("ProxzarTokenExpTime");
    if (_token) {
      const expTime = new Date(_token);
      const curTime = new Date();
      const diffMilliseconds = expTime.getTime() - curTime.getTime();
      const diffSeconds = diffMilliseconds / 1000;
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      
      if (hours * 60 + minutes < 5) { // return invalid if token expires in less than 5 minutes
        return false;
      }
      return true;
    }
    return false;
  };

  // Function to fetch access token and store it in session storage
  const fetchToken = async () => {
    try {
      const response = await fetch(proxzarGetAccessTokenurl + new URLSearchParams({
            DeveloperEmailId: "babasrik@hotmail.com",
            AppName: "BECN_PRXR_APP",
          })
      );
      const data = await response.json();
     
      
      const { access_token, expires_in } = data;
      const expirationTime = new Date(new Date().getTime() + expires_in * 1000);
      sessionStorage.setItem("ProxzarToken", access_token);
      sessionStorage.setItem("ProxzarTokenExpTime", expirationTime);
      sessionStorage.setItem("ProxzarActiveALid", divProxzarSbProxId);
      setToken(access_token);
      setTokenExpTime(expirationTime);
    } catch (error) {
      console.error("Error fetching token:", error);
      alert(`Error from Server: \n\t ${error.message}\n`);
    }
  };



 
  // const fetchAuthToken = async () => {
  //   try {
  //     const response = await fetch(proxzarToken, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/x-www-form-urlencoded",
  //       },
  //       body: new URLSearchParams({
  //         UserName: "yhemanth@proxzar.com",
  //         UserPassword: "PrXr#12345"
  //       }),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  
  //     const data = await response.json(); 
  //     console.log( data); 
    
    
      

  //     const { access_token ,token_type} = data; // Extract the access token
  //     console.log("Access token:", access_token);
  //     console.log("tokentype",token_type);
  //      // Log the access token
  
     
  //     setAuthToken(access_token);
  
  //   } catch (error) {
  //     console.error("Error fetching auth token:", error);
  //   }
  // };
  
  
  
 



  // Fetch token and capability token on component mount
  useEffect(() => {
    //  fetchCapabilityToken();
     fetchToken();
  
  
  }, []);


//all input handle functions are placed below here 

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isTokenValid()) {
      alert("Token is expired or invalid. Fetching new token...");
      await fetchToken();

      if (!isTokenValid()) {
        setResponses(["Unable to fetch valid token. Please try again later."]);
        return;
      }
    }
    setLoading(true);
    try {
      const response = await fetch(proxzarGetResponsesUrl + "?" + new URLSearchParams({
            QuestionPosed: question,
            IncludeResponsesFromCustomKnowledgeCorpus: true,
            IncludeResponsesFromProxzarKnowledgeCorpus: false,
            IncludeResponsesFromWikipedia: false,
            IncludeResponsesFromGoogleBooks: false,
            ProxzarId: sessionStorage.getItem("ProxzarActiveALid"),
            SetContext: false,
          }),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);

      const responseData = data 
      console.log(responseData);

      const formattedResponses = responseData.map((item) => {
        const responseText = item.Response.replace(/\n/g, " ");
        const responseParts = responseText
        // const productDescription = responseParts[1] || "No Description";
        const id = responseParts|| "No responses";
        console.log(id);
        
        return { id };
      });
      setResponses(formattedResponses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      setResponses(["Failed to fetch responses. Error: " + error.message]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
      // setQuestion("");
    }
  };

  const authToken = "_BHPTkmY0u0RmYfaNJN6yhADBmAY3-YzaFYR_eKVhAZA8V_KI6rHqaG3qblT3IfPN5YhmDQxNA9EM5H5EbuOq2iBlxkao16wpQYyAWnMzSE917943-fOEazWw1pXwEIeYVcth9L5H9bXf1uadLN2sdelb6ae3sb11sDdZzcLIYyY5K54bTa5MAtUAnAP63ufITvu_TMHv99ty0yIYxUN9UXj8M3khIC_ofR4xJoAtytRJTDSytoXFTNWGUitGBADXrmI_3ZZ2X0lilTVtxYk0ZytwT9LtOCf8Y1ZYIyiZUNp-ozKhuZILR8PiSr25dTSuJhvQVPZqpoG2rHLILH4JD0HPKLUXOUilF_Ldoh6yjkdJ6X1enTUyapflYGV6RCGVgGg_npXpGUN2SY9QditLftlvA1I9ufIjVtIA2AXgeJw7llar9YjEFpeIbvqGgb33S2czeo8bB6I85MSF2HFh9AvLZnl2s1WHtApnKXbV2qzG3u4GPsgBdmUuCIk90YiwBZ9s5lwT8uuZsGjNoGZmw";
  const handleResponseClick = async (response) => {
    setFaqLoading(true); // Start loading animation
    try {
      const postResponse = await fetch(generateQueryFromResponse, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${authToken}`,
        },
        body: new URLSearchParams({
          ProxzarId: divProxzarSbProxId,
          Context: response.id,
        }),
      });
  
      if (!postResponse.ok) {
        throw new Error(`HTTP error! Status: ${postResponse.status}`);
      }
  
      const text = await postResponse.text();
      console.log("Raw Response:", text);
  
      // let parsedText;
      // try {
      //   parsedText = JSON.parse(text);
      // } catch (e) {
      //   console.error("Response is not valid JSON. Falling back to text processing.");
      //   parsedText = text; // Use raw text if JSON parsing fails
      // }
  
      // Fetch similar questions with the parsed text or raw text
      const similarQuestionsResponse = await fetch(getSimilarQuestionsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${authToken}`,
        },
        body: new URLSearchParams({
          ProxzarId: divProxzarSbProxId,
          Question: text,
        }),
      });
  
      if (!similarQuestionsResponse.ok) {
        throw new Error(`HTTP error! Status: ${similarQuestionsResponse.status}`);
      }
  
      const faqData = await similarQuestionsResponse.json();
      console.log(faqData);
  
      // Set faqs to store multiple questions
      setFaqs(Array.isArray(faqData) ? faqData.slice(0, 4) : []);
    } catch (error) {
      console.error("Error making request:", error);
      setFaqs([{ question: "Error occurred while generating the question.", answer: "" }]);
    } finally {
      setFaqLoading(false); // End loading animation
    }
  };
  

  const handleFaqToggle = (index) => {
    setVisibleFaqIndex(visibleFaqIndex === index ? null : index);
  };
  return (
    <div className="App">
      <header className="header">
        <img src={proxzar} alt="Proxzar Logo" height="60" width="200" />

        <span style={{color:"black",marginTop:"90px,",fontSize:"9px"}}><strong>V.1.0</strong></span>

      </header>
      <div className="search-section">
        <input
          type="text"
          id="TxtProxzarWidgtInputText"
          placeholder="Enter question..."
          onChange={handleQuestionChange}
          onKeyPress={handleKeyPress}
          value={question}
          disabled={!token}
        /> 
      </div>
      <div className="responses-section">
        {loading ? (
           <div className="loadermain">
           <div className="loader" ></div>
           <div className="loadingmsg"  > <strong style={{fontSize:"15px",color:"white"}}>Loading Responses Please Wait...</strong></div>
     
         </div>
          
        ) : (
          <ul>
            <h4 style={{color:"black"}} > Responses: {responses.length}</h4>
            {responses.length > 0
              ? responses.map((response, index) => (
                  <li key={index} >
                    <a style={{letterSpacing:"0.5px" , lineHeight:"23px"}  }
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleResponseClick(response);
                      }}
                    >
                      {response.id?response.id : "no responses"} 
                    </a>
                  </li>
                ))
              : ""}
          </ul>
        )}
      </div>

      <div id="faq-section">
  <div className="side-bar">
    <div className="prox-call-btn ">
      <input type="button" className="call-btn" />
    </div>
    <div>
      <form className="form">
        <input style={{ marginLeft: "55px" ,}} type="file" accept="*" />
        <button className="upload" style={{ marginRight: "10px" ,width:"55px",background: "#1005b0",color:"white",borderRadius:"3px",padding:"8px",border:"none"}} type="submit">
          upload
        </button>
      </form>
    </div>
  </div>
  <div id="faq-section-resp">
    <h4 className="response" style={{ color: "#1005b0" }}>
      Dynamic FAQs
    </h4>
    {faqLoading ? (
      <div className="loadermain">
      <div className="loader" ></div>
      <div className="loadingmsg"  > <strong style={{fontSize:"15px",color:"white"}}>Getting Dynamic Faq's Please Wait...</strong></div>

    </div>
    ) : (
      <div className="results" style={{cursor:"pointer"}}>
      
      {faqs.length > 0
        ? faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <h5
                className="faq-question"
                onClick={() => handleFaqToggle(index)}
              >
                {faq.question}
                
              </h5>
              {visibleFaqIndex === index && (
                <p className="faq-answer" style={{fontSize:"13px"}}>{faq.response || "No answer available."}</p>
                
              )}
            </div>
          )) : ("no responses")
       }
    </div>
  )}
    
  </div>
</div>
    </div>
    
  );
}

export default App;
