import { createThirdwebClient } from "thirdweb";

// Client ID pubblico per SDK client-side (fallback per evitare crash in prod)
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "023dd6504a82409b2bc7cb971fd35b16";

export const client = createThirdwebClient({ clientId });