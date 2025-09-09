import { serverHttp } from "./http.js";
import "./websocket.js";

const PORT = process.env.PORT || 3001;

serverHttp.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
