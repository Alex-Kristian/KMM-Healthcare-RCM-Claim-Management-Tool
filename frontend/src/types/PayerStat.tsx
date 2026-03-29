export interface PayerStat {
  payer: string;
  revenue: number;
  denialRate: number;
  reimbursement: number;
  avgAR: number;
  totalClaims: number;
  firstPassRate: number;
  deniedCount: number;
  pendingCount: number;
  paidCount: number;
  riskScore: number;
};