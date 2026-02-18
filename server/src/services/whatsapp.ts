const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, "").replace(/^0+/, "");
};

export interface SendTemplateParams {
  phoneNumberId: string;
  accessToken: string;
  toPhone: string;
  templateName: string;
  languageCode?: string;
  bodyParameters?: string[];
  headerParameters?: string[];
  buttonParameters?: string[];
}

export const sendWhatsAppTemplate = async (
  params: SendTemplateParams,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const {
    phoneNumberId,
    accessToken,
    toPhone,
    templateName,
    languageCode = "es",
    bodyParameters = [],
    headerParameters = [],
    buttonParameters = [],
  } = params;

  const to = normalizePhone(toPhone);
  if (to.length < 9) {
    return { success: false, error: "Número de teléfono inválido" };
  }

  const components: Record<string, unknown>[] = [];

  if (bodyParameters.length > 0) {
    components.push({
      type: "body",
      parameters: bodyParameters.map((text) => ({ type: "text", text })),
    });
  }

  if (headerParameters.length > 0) {
    components.push({
      type: "header",
      parameters: headerParameters.map((text) => ({ type: "text", text })),
    });
  }

  if (buttonParameters.length > 0) {
    components.push({
      type: "button",
      sub_type: "quick_reply",
      index: "0",
      parameters: buttonParameters.map((payload) => ({
        type: "payload",
        payload,
      })),
    });
  }

  const body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(components.length > 0 && { components }),
    },
  };

  const url = `${GRAPH_API_BASE}/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as {
    messages?: Array<{ id: string }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    const errMsg = data.error?.message ?? `HTTP ${res.status}`;
    return { success: false, error: errMsg };
  }

  const messageId = data.messages?.[0]?.id;
  return { success: true, messageId };
};

export interface AppointmentTemplateData {
  clientName: string;
  serviceName: string;
  businessName: string;
  dateFormatted: string;
  timeFormatted: string;
}

export const TEMPLATE_APPOINTMENT_CONFIRMATION = "cita_confirmada";
export const TEMPLATE_APPOINTMENT_REMINDER = "recordatorio_cita";

export const sendAppointmentConfirmation = async (
  phoneNumberId: string,
  accessToken: string,
  toPhone: string,
  data: AppointmentTemplateData,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  return sendWhatsAppTemplate({
    phoneNumberId,
    accessToken,
    toPhone,
    templateName: TEMPLATE_APPOINTMENT_CONFIRMATION,
    languageCode: "es",
    bodyParameters: [
      data.clientName,
      data.serviceName,
      data.businessName,
      data.dateFormatted,
      data.timeFormatted,
    ],
  });
};

export const sendAppointmentReminder = async (
  phoneNumberId: string,
  accessToken: string,
  toPhone: string,
  data: AppointmentTemplateData,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  return sendWhatsAppTemplate({
    phoneNumberId,
    accessToken,
    toPhone,
    templateName: TEMPLATE_APPOINTMENT_REMINDER,
    languageCode: "es",
    bodyParameters: [
      data.clientName,
      data.serviceName,
      data.businessName,
      data.dateFormatted,
      data.timeFormatted,
    ],
  });
};
