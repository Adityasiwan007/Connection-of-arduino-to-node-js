const dialogflow = require('dialogflow');
const uuid = require('uuid');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getLineFromConsole(){
    return new Promise((resolve,reject)=>{
        rl.question('> ', (answer) => {
            // TODO: Log the answer in a database
            //console.log(`Thank you for your valuable feedback: ${answer}`);
            resolve(answer)
            //rl.close();
          });
    })
}
/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(projectId = 'your-project-id') {
  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
 while(1){
  let line = await getLineFromConsole()
  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: line,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };
  console.log('sending reuqest')
  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
  /*
   structure
   intent - object - result.intent.displayName
   parameters - object - {fileds:object},kind and a fild with the kind value will have the actual feild value, will be empty is not present
   {last-name:{kind:"stringValue",stringvalue:""}}
   allRequiredParamsPresent:boolean
   if not all the parameters are prense the fulfillmentText will have follow up question
    seems there is no way to know if the fulfillmentText is a followup question or a response, we could depends on allRequiredParamsPresent and
    the fact that there should be no fulfillmentText
  */ 
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
    console.log(`  paramters ${JSON.stringify(result.parameters)}`)
    console.log(` allRequiredParamsPresent: ${result.allRequiredParamsPresent}`)
  } else {
    console.log(`  No intent matched.`);
  }
 }
}

(async ()=>{
    console.log('function execution started')
    await runSample('evident-flame-226106')
    console.log('function execution completed')
})()
