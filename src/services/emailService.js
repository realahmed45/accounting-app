import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_q0s6g2d";
const INVITE_TEMPLATE_ID = "template_d8x7n2o";
const TRANSFER_TEMPLATE_ID = "template_81hhrvb";
const PUBLIC_KEY = "1JY0sHgbouqI1ds7S";

// Initialize EmailJS v4 correctly
emailjs.init({
  publicKey: PUBLIC_KEY,
  blockHeadless: true,
});

window.DEBUG_EMAIL = { logs: [], lastResult: null };

const logTrace = (msg, data) => {
  const entry = `[${new Date().toISOString()}] ${msg}`;
  console.log(entry, data || "");
  window.DEBUG_EMAIL.logs.push({ timestamp: new Date(), msg, data });
};

const PERMISSION_LABELS = {
  makeExpense: "Log expenses",
  calculateCash: "Calculate cash flow",
  accessSettings: "Access settings",
  addUser: "Manage users",
  addCategories: "Manage categories",
  addBankAccount: "Manage bank accounts",
  createAccountDownward: "Create sub-accounts",
  createAccountUpward: "Link to parent accounts",
};

const buildPermissionsList = (permissions) => {
  if (!permissions) return "Standard access";
  const granted = Object.entries(permissions)
    .filter(([, v]) => v)
    .map(([k]) => PERMISSION_LABELS[k] || k);
  return granted.length > 0 ? granted.join(", ") : "View only";
};

/**
 * Send a member invitation email via EmailJS.
 */
export const sendInvitationEmail = async ({
  toEmail,
  inviterName,
  accountName,
  inviteLink,
  permissions,
}) => {
  logTrace("Calling sendInvitationEmail", { toEmail, template: INVITE_TEMPLATE_ID });
  
  try {
    const params = {
      to_email: toEmail,
      inviter_name: inviterName,
      account_name: accountName,
      invite_link: inviteLink,
      permissions_list: buildPermissionsList(permissions),
    };

    const response = await emailjs.send(
      SERVICE_ID,
      INVITE_TEMPLATE_ID,
      params,
      { publicKey: PUBLIC_KEY }
    );
    
    logTrace("EmailJS SUCCESS", response);
    window.DEBUG_EMAIL.lastResult = response;
    return { sent: true };
  } catch (err) {
    logTrace("EmailJS CRITICAL ERROR", err);
    window.DEBUG_EMAIL.lastResult = err;
    return { sent: false, error: err?.text || err?.message || "Unknown error" };
  }
};

/**
 * Send an ownership transfer email via EmailJS.
 */
export const sendOwnershipTransferEmail = async ({
  toEmail,
  inviterName,
  accountName,
  inviteLink,
}) => {
  logTrace("Calling sendOwnershipTransferEmail", { toEmail, template: TRANSFER_TEMPLATE_ID });
  
  try {
    const params = {
      to_email: toEmail,
      inviter_name: inviterName,
      account_name: accountName,
      invite_link: inviteLink,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TRANSFER_TEMPLATE_ID,
      params,
      { publicKey: PUBLIC_KEY }
    );
    
    logTrace("EmailJS SUCCESS", response);
    window.DEBUG_EMAIL.lastResult = response;
    return { sent: true };
  } catch (err) {
    logTrace("EmailJS CRITICAL ERROR", err);
    window.DEBUG_EMAIL.lastResult = err;
    return { sent: false, error: err?.text || err?.message || "Unknown error" };
  }
};
