import { hello } from "./module/hello.js";
import AirDatepicker from "air-datepicker";
import "air-datepicker/air-datepicker.css";

new AirDatepicker("#date");

console.log("Hello from index");
console.log(hello);
