import { createThirdwebClient } from "thirdweb";

// Client ID pubblico per SDK client-side
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

export const client = createThirdwebClient({ clientId });