#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "Mi5";
const char* password =  "tcs#1234";
const char* mqttServer = "192.168.43.20";
const int mqttPort = 1446;
const char* mqttUser = "";
const char* mqttPassword = "";

WiFiClient espClient;
PubSubClient client(espClient);


void setup() {
  Serial.begin(115200);         
  delay(10);
  Serial.println('\n');
  
  WiFi.begin(ssid, password);   
 
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  
  Serial.print(ssid);

 client.setServer(mqttServer, mqttPort);
 
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");

    if (client.connect("ESP32Client", mqttUser, mqttPassword )) {

      Serial.println("connected");

    } else {

      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);

    }
  }
 client.publish("esp/test", "Hello from ESP32");

  Serial.println(WiFi.localIP());         
}
 
void loop() {
  client.loop();
}
