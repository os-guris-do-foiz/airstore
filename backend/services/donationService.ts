import { AppDataSource } from "../db/index";
import { Donation } from "../domains/donation";
import { User } from "../domains/user";

export const REAIS_PER_WEEK = 10;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const donationRepo = () => AppDataSource.getRepository<Donation>("Donation");
const userRepo = () => AppDataSource.getRepository<User>("User");

export const calculateDonorExpiry = (
  currentExpiry: Date | string | null | undefined,
  amountInReais: number,
  now = Date.now()
): { weeks: number; newExpiry: Date | null } => {
  const weeks = Math.floor(amountInReais / REAIS_PER_WEEK);
  if (weeks <= 0) return { weeks, newExpiry: null };

  const currentExpiryMs = currentExpiry ? new Date(currentExpiry).getTime() : 0;
  const base = Math.max(now, currentExpiryMs);
  return { weeks, newExpiry: new Date(base + weeks * WEEK_MS) };
};

export const grantDonorTime = async (userId: string, amountInReais: number) => {
  const user = await userRepo().findOne({ where: { id: userId } });
  if (!user) throw new Error("Usuário não encontrado para conceder o benefício de doador.");

  const { weeks, newExpiry } = calculateDonorExpiry(user.donor_expiry, amountInReais);
  if (weeks <= 0 || !newExpiry) return; // doação abaixo de R$10 não gera tempo (mas a doação em si já foi registrada)

  const roles = Array.from(new Set([...(user.roles || []), "PREMIUM"]));
  await userRepo().update(userId, { is_donor: true, donor_expiry: newExpiry, roles });
};

const formatDonation = (d: Donation) => ({
  id: d.id,
  amount: Number(d.amount),
  method: d.method,
  status: d.status,
  created_at: d.created_at,
  donor_name: d.user?.name || d.donor_name || "Apoiador Anônimo",
  donor_avatar: d.user?.avatar || null,
  is_premium: d.user ? d.user.is_donor : Number(d.amount) >= REAIS_PER_WEEK,
});

export const getPublicDonations = async (limit = 20) => {
  const donations = await donationRepo().find({
    where: { status: "APPROVED" },
    relations: { user: true },
    order: { created_at: "DESC" },
    take: Math.min(Math.max(limit, 1), 100),
  });
  return donations.map(formatDonation);
};

export const registerManualDonation = async (data: { userId?: string; donorName?: string; amount: number }) => {
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Valor da doação inválido.");
  if (!data.userId && !data.donorName?.trim()) {
    throw new Error("Informe o usuário vinculado ou um nome para o apoiador.");
  }

  const donation = donationRepo().create({
    user: data.userId ? { id: data.userId } : null,
    donor_name: data.donorName?.trim() || null,
    amount,
    method: "MANUAL",
    status: "APPROVED",
  }) as unknown as Donation;
  await donationRepo().save(donation);

  if (data.userId) await grantDonorTime(data.userId, amount);

  return formatDonation(await donationRepo().findOne({ where: { id: donation.id }, relations: { user: true } }) as Donation);
};

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
export const isMercadoPagoConfigured = () => !!MP_ACCESS_TOKEN;

export const processMercadoPagoPayment = async (paymentId: string) => {
  if (!MP_ACCESS_TOKEN) {
    console.warn("⚠️  MP_ACCESS_TOKEN não configurado — notificação do Mercado Pago ignorada.");
    return;
  }

  const already = await donationRepo().findOne({ where: { external_id: paymentId } });
  if (already) return; // notificação repetida (o Mercado Pago reenvia webhooks)

  const { MercadoPagoConfig, Payment } = await import("mercadopago");
  const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
  const payment = await new Payment(client).get({ id: paymentId });

  const amount = Number(payment.transaction_amount || 0);
  const status = payment.status === "approved" ? "APPROVED" : payment.status === "rejected" ? "REJECTED" : "PENDING";
  const userId = payment.external_reference || undefined;

  const donation = donationRepo().create({
    user: userId ? { id: userId } : null,
    donor_name: payment.payer?.first_name || null,
    amount,
    method: "MERCADO_PAGO",
    external_id: paymentId,
    status,
  }) as unknown as Donation;
  await donationRepo().save(donation);

  if (status === "APPROVED" && userId) {
    await grantDonorTime(userId, amount);
  }
};
