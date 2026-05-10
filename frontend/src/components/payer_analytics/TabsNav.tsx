export default function TabsNav({ activeTab, setActiveTab }: any) {
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "drilldown", label: "Drilldown" },
  ];

  return (
    <ul className="nav nav-tabs mb-4">
      {tabs.map((tab) => (
        <li key={tab.key} className="nav-item">
        <button
            className={`nav-link fw-semibold ${activeTab === tab.key ? "active" : "text-muted"}`}
            style={{ fontSize: 13 }}
            onClick={() => setActiveTab(tab.key)}
        >
            <i className="bi me-1" />
            {tab.label}
        </button>
        </li>
      ))}
    </ul>
  );
}