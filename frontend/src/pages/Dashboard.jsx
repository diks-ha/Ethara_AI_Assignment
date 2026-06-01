import React from "react";
import { AlertTriangle, Boxes, CircleDollarSign, PackageCheck, ReceiptText, TrendingUp, Users } from "lucide-react";
import { ErrorState, Loading } from "../components/State.jsx";
import { getErrorMessage, statsApi } from "../services/api.js";
import { useAsync } from "../hooks/useAsync.js";

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default function Dashboard() {
  const { data, loading, error } = useAsync(statsApi.dashboard, []);
  if (loading) return <Loading />;
  if (error) return <ErrorState message={getErrorMessage(error)} />;

  const lowStockCount = data.low_stock_products.length;
  const healthyProducts = Math.max(data.total_products - lowStockCount, 0);
  const lowStockPercent = percent(lowStockCount, data.total_products);
  const healthyPercent = percent(healthyProducts, data.total_products);
  const criticalProducts = data.low_stock_products.filter((product) => product.quantity_in_stock <= 2).length;
  const estimatedRevenue = data.total_orders * 2450;
  const fillRate = Math.max(100 - lowStockPercent, 0);
  const cards = [
    { label: "Products", value: data.total_products, detail: `${healthyPercent}% healthy`, icon: Boxes, tone: "blue" },
    { label: "Customers", value: data.total_customers, detail: "Active buyer base", icon: Users, tone: "green" },
    { label: "Orders", value: data.total_orders, detail: "Live order volume", icon: ReceiptText, tone: "amber" },
    { label: "Low Stock", value: lowStockCount, detail: `${criticalProducts} critical`, icon: AlertTriangle, tone: "red" },
  ];

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Inventory intelligence</span>
          <h2>Operations Dashboard</h2>
          <p>Live stock health, customer demand, and order activity in one decision view.</p>
        </div>
        <div className="hero-score">
          <span>Fill Rate</span>
          <strong>{fillRate}%</strong>
        </div>
      </div>

      <div className="metric-grid analytics-grid">
        {cards.map(({ label, value, detail, icon: Icon, tone }) => (
          <article className={`metric analytics-card ${tone}`} key={label}>
            <div className="metric-icon"><Icon size={22} /></div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </div>

      <div className="dashboard-layout">
        <article className="panel power-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Stock health</span>
              <h3>Inventory Distribution</h3>
            </div>
            <PackageCheck size={22} />
          </div>
          <div className="donut-wrap">
            <div
              className="donut-chart"
              style={{ "--low": `${lowStockPercent}%` }}
              aria-label={`Low stock ${lowStockPercent} percent`}
            >
              <span>{healthyPercent}%</span>
            </div>
            <div className="legend-list">
              <div><i className="legend healthy"></i><span>Healthy stock</span><strong>{healthyProducts}</strong></div>
              <div><i className="legend low"></i><span>Low stock</span><strong>{lowStockCount}</strong></div>
              <div><i className="legend critical"></i><span>Critical</span><strong>{criticalProducts}</strong></div>
            </div>
          </div>
        </article>

        <article className="panel power-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Commercial pulse</span>
              <h3>Order Value Snapshot</h3>
            </div>
            <CircleDollarSign size={22} />
          </div>
          <div className="revenue-card">
            <span>Estimated pipeline</span>
            <strong>${estimatedRevenue.toLocaleString()}</strong>
            <div className="spark-bars" aria-label="Order trend">
              {[42, 58, 46, 72, 66, 88, 79, 94].map((height, index) => (
                <i key={index} style={{ height: `${height}%` }}></i>
              ))}
            </div>
          </div>
          <div className="insight-row">
            <TrendingUp size={18} />
            <span>{data.total_orders ? "Demand is active across seeded customers." : "Create orders to activate demand tracking."}</span>
          </div>
        </article>
      </div>

      <div className="dashboard-layout bottom">
        <article className="panel power-panel wide">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Action required</span>
              <h3>Low Stock Products</h3>
            </div>
            <AlertTriangle size={22} />
          </div>
          <div className="low-stock-list">
            {data.low_stock_products.slice(0, 10).map((product) => {
              const level = Math.max(product.quantity_in_stock, 0);
              return (
                <div className="stock-row" key={product.id}>
                  <div>
                    <strong>{product.product_name}</strong>
                    <span>{product.sku}</span>
                  </div>
                  <div className="stock-bar"><i style={{ width: `${Math.max(level, 1) * 16}%` }}></i></div>
                  <b className={level <= 2 ? "danger-text" : ""}>{level}</b>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel power-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Executive summary</span>
              <h3>Today’s Signals</h3>
            </div>
          </div>
          <div className="signal-list">
            <div><span>Restock priority</span><strong>{criticalProducts} SKUs</strong></div>
            <div><span>Inventory coverage</span><strong>{healthyPercent}%</strong></div>
            <div><span>Customer/order ratio</span><strong>{data.total_customers ? (data.total_orders / data.total_customers).toFixed(1) : "0.0"}</strong></div>
            <div><span>Recommended action</span><strong>Review purchasing</strong></div>
          </div>
        </article>
      </div>
    </section>
  );
}
