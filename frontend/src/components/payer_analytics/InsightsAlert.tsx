type Props = { insights: any[] };

export default function InsightsAlert({ insights }: Props) {
  if (!insights.length) return null;

  return (
        <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: 10 }}>
          <div className="card-body py-3">
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-exclamation-triangle-fill text-danger me-2" style={{ fontSize: 16 }} />
              <span className="fw-bold text-dark" style={{ fontSize: 13 }}>Action Required</span>
            </div>
            {insights.map((ins, i) => (
              <div key={i} className={`d-flex align-items-start gap-2 mb-1 text-${ins.variant}`} style={{ fontSize: 13 }}>
                <i className={`me-2 mt-1 flex-shrink-0`} />
                <li>{ins.text}</li>
              </div>
            ))}
          </div>
        </div>
  );
}