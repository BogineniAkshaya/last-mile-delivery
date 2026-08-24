import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [view, setView] = useState("dashboard");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [trackingData, setTrackingData] = useState([]);
  const [zones, setZones] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [agentFilter, setAgentFilter] = useState("ALL");
  const [pricing, setPricing] = useState(null);
  const [message, setMessage] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [orderForm, setOrderForm] = useState({
    pickupAddress: "",
    dropAddress: "",
    pickupZone: "",
    dropZone: "",
    length: "",
    breadth: "",
    height: "",
    actualWeight: "",
    orderType: "B2C",
    paymentType: "PREPAID",
  });

  useEffect(() => {
    if (token) {
      loadZones();
    }
  }, [token]);

  const loadZones = async () => {
    try {
      const response = await fetch(`${API}/admin/zones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setZones(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setMessage("Login successful!");
      setView("dashboard");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const register = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setMessage("Registration successful!");
      setView("dashboard");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const createOrder = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...orderForm,
          length: Number(orderForm.length),
          breadth: Number(orderForm.breadth),
          height: Number(orderForm.height),
          actualWeight: Number(orderForm.actualWeight),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setPricing(data.pricing);
      setMessage("Order created successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const assignAgent = async (orderId) => {
    try {
      const response = await fetch(`${API}/agents/auto-assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          latitude: 13.0827,
          longitude: 80.2707,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage(
        `Agent assigned successfully: ${data.agent.name} (${data.distanceKm} km away)`
      );

      loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        `${API}/tracking/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            remarks: `Status updated to ${status}`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage(`Order status updated to ${status}`);

      loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const rescheduleOrder = async (orderId) => {
    const newDate = window.prompt(
      "Enter new delivery date (YYYY-MM-DD):"
    );

    if (!newDate) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/tracking/${orderId}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            newDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage("Order rescheduled successfully!");

      loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const loadTracking = async (orderId) => {
    try {
      const response = await fetch(
        `${API}/tracking/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setTrackingData(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      /*
       * Delivery agents should only see orders assigned to them.
       * Admins and customers keep the existing behavior.
       */
      if (user?.role === "delivery_agent") {
        const currentUserId = user?._id || user?.id;

        const agentOrders = data.filter((order) => {
          const assignedId =
            typeof order.assignedAgent === "object"
              ? order.assignedAgent?._id || order.assignedAgent?.id
              : order.assignedAgent;

          return (
            assignedId &&
            currentUserId &&
            String(assignedId) === String(currentUserId)
          );
        });

        setOrders(agentOrders);
      } else {
        setOrders(data);
      }

      setView("orders");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const orderZone =
      order.pickupZone?.name ||
      order.pickupZone ||
      "";

    const orderAgent =
      order.assignedAgent?.name ||
      order.assignedAgent ||
      "";

    const statusMatch =
      statusFilter === "ALL" ||
      order.status === statusFilter;

    const zoneMatch =
      zoneFilter === "ALL" ||
      orderZone === zoneFilter;

    const agentMatch =
      agentFilter === "ALL" ||
      orderAgent === agentFilter;

    return statusMatch && zoneMatch && agentMatch;
  });

  const availableZones = [
    ...new Set(
      orders
        .map(
          (order) =>
            order.pickupZone?.name ||
            order.pickupZone
        )
        .filter(Boolean)
    ),
  ];

  const availableAgents = [
    ...new Set(
      orders
        .map(
          (order) =>
            order.assignedAgent?.name ||
            order.assignedAgent
        )
        .filter(Boolean)
    ),
  ];

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setPricing(null);
    setOrders([]);
    setView("dashboard");
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>🚚 Last-Mile Delivery</h1>
          <p>Smart delivery management platform</p>

          <div className="auth-buttons">
            <button onClick={() => setView("login")}>
              Login
            </button>

            <button onClick={() => setView("register")}>
              Register
            </button>
          </div>

          {message && (
            <div className="message">
              {message}
            </div>
          )}

          {view === "login" && (
            <form onSubmit={login}>
              <h2>Login</h2>

              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    password: e.target.value,
                  })
                }
                required
              />

              <button type="submit">
                Login
              </button>
            </form>
          )}

          {view === "register" && (
            <form onSubmit={register}>
              <h2>Create Account</h2>

              <input
                placeholder="Full Name"
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    password: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Phone"
                value={registerForm.phone}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    phone: e.target.value,
                  })
                }
                required
              />

              <button type="submit">
                Register
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>🚚 Last-Mile Delivery Tracker</h1>

          <p>
            Welcome, {user?.name} · {user?.role}
          </p>
        </div>

        <button onClick={logout}>
          Logout
        </button>
      </header>

      <nav>
        <button
          onClick={() => setView("dashboard")}
        >
          Dashboard
        </button>

        <button
          onClick={() => {
            setPricing(null);
            setMessage("");
            setView("create-order");
          }}
        >
          Create Order
        </button>

        <button onClick={loadOrders}>
          All Orders
        </button>
      </nav>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {view === "dashboard" && (
        <main className="dashboard">
          <div className="hero">
            <h2>
              Delivery Management Dashboard
            </h2>

            <p>
              Create, track and manage last-mile
              deliveries from one place.
            </p>
          </div>

          <div className="stats">
            <div>
              <span>📦</span>
              <h3>Orders</h3>
              <p>Manage deliveries</p>
            </div>

            <div>
              <span>🚚</span>
              <h3>Agents</h3>
              <p>Smart assignment</p>
            </div>

            <div>
              <span>📍</span>
              <h3>Tracking</h3>
              <p>Live status timeline</p>
            </div>

            <div>
              <span>💰</span>
              <h3>Pricing</h3>
              <p>Automatic calculation</p>
            </div>
          </div>
        </main>
      )}

      {view === "create-order" && (
        <main className="form-page">
          <h2>Create Delivery Order</h2>

          <form
            onSubmit={createOrder}
            className="order-form"
          >
            <input
              placeholder="Pickup Address"
              value={orderForm.pickupAddress}
              onChange={(e) =>
                setOrderForm({
                  ...orderForm,
                  pickupAddress: e.target.value,
                })
              }
              required
            />

            <input
              placeholder="Drop Address"
              value={orderForm.dropAddress}
              onChange={(e) =>
                setOrderForm({
                  ...orderForm,
                  dropAddress: e.target.value,
                })
              }
              required
            />

            <select
              value={orderForm.pickupZone}
              onChange={(e) =>
                setOrderForm({
                  ...orderForm,
                  pickupZone: e.target.value,
                })
              }
              required
            >
              <option value="">
                Select Pickup Zone
              </option>

              {zones.map((zone) => (
                <option
                  key={zone._id}
                  value={zone._id}
                >
                  {zone.name}
                </option>
              ))}
            </select>

            <select
              value={orderForm.dropZone}
              onChange={(e) =>
                setOrderForm({
                  ...orderForm,
                  dropZone: e.target.value,
                })
              }
              required
            >
              <option value="">
                Select Drop Zone
              </option>

              {zones.map((zone) => (
                <option
                  key={zone._id}
                  value={zone._id}
                >
                  {zone.name}
                </option>
              ))}
            </select>

            <div className="grid">
              <input
                type="number"
                placeholder="Length (cm)"
                value={orderForm.length}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    length: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Breadth (cm)"
                value={orderForm.breadth}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    breadth: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Height (cm)"
                value={orderForm.height}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    height: e.target.value,
                  })
                }
                required
              />
            </div>

            <input
              type="number"
              placeholder="Actual Weight (kg)"
              value={orderForm.actualWeight}
              onChange={(e) =>
                setOrderForm({
                  ...orderForm,
                  actualWeight: e.target.value,
                })
              }
              required
            />

            <select
              value={orderForm.orderType}
              onChange={(e) =>
                setOrderForm({
                  ...orderForm,
                  orderType: e.target.value,
                })
              }
            >
              <option value="B2C">B2C</option>
              <option value="B2B">B2B</option>
            </select>

            <select
              value={orderForm.paymentType}
              onChange={(e) =>
                setOrderForm({
                  ...orderForm,
                  paymentType: e.target.value,
                })
              }
            >
              <option value="PREPAID">
                Prepaid
              </option>

              <option value="COD">
                COD
              </option>
            </select>

            <button type="submit">
              Calculate & Create Order
            </button>
          </form>

          {pricing && (
            <div className="pricing-card">
              <h2>💰 Order Pricing</h2>

              <p>
                Volumetric Weight:
                <strong>
                  {" "}
                  {Number(
                    pricing.volumetricWeight
                  ).toFixed(2)}{" "}
                  kg
                </strong>
              </p>

              <p>
                Chargeable Weight:
                <strong>
                  {" "}
                  {Number(
                    pricing.chargeableWeight
                  ).toFixed(2)}{" "}
                  kg
                </strong>
              </p>

              <p>
                Delivery Charge:
                <strong>
                  {" "}
                  ₹
                  {Number(
                    pricing.deliveryCharge
                  ).toFixed(2)}
                </strong>
              </p>

              <p>
                COD Surcharge:
                <strong>
                  {" "}
                  ₹
                  {Number(
                    pricing.codSurcharge
                  ).toFixed(2)}
                </strong>
              </p>

              <hr />

              <h2>
                Total:
                <strong>
                  {" "}
                  ₹
                  {Number(
                    pricing.totalCharge
                  ).toFixed(2)}
                </strong>
              </h2>

              <p>
                Zone Type: {pricing.zoneType}
              </p>
            </div>
          )}
        </main>
      )}

      {view === "orders" && (
        <main className="orders-page">
          <h2>All Orders</h2>

          {user?.role === "admin" && (
            <div className="admin-filters">
              <h3>👑 Admin Filters</h3>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="CREATED">
                  Created
                </option>

                <option value="PICKED_UP">
                  Picked Up
                </option>

                <option value="IN_TRANSIT">
                  In Transit
                </option>

                <option value="OUT_FOR_DELIVERY">
                  Out for Delivery
                </option>

                <option value="DELIVERED">
                  Delivered
                </option>

                <option value="FAILED">
                  Failed
                </option>

                <option value="RESCHEDULED">
                  Rescheduled
                </option>
              </select>

              <select
                value={zoneFilter}
                onChange={(e) =>
                  setZoneFilter(e.target.value)
                }
              >
                <option value="ALL">
                  All Zones
                </option>

                {availableZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>

              <select
                value={agentFilter}
                onChange={(e) =>
                  setAgentFilter(e.target.value)
                }
              >
                <option value="ALL">
                  All Agents
                </option>

                {availableAgents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>
          )}

          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : filteredOrders.length === 0 ? (
            <p>No orders match the current filters.</p>
          ) : (
            filteredOrders.map((order) => (
              <div
                className="order-card"
                key={order._id}
              >
                <h3>
                  Order #{order._id.slice(-6)}
                </h3>

                <p>
                  <strong>Status:</strong>{" "}
                  {order.status}
                </p>

                <p>
                  <strong>Type:</strong>{" "}
                  {order.orderType}
                </p>

                <p>
                  <strong>Payment:</strong>{" "}
                  {order.paymentType}
                </p>

                <p>
                  <strong>Total:</strong>{" "}
                  ₹{order.totalCharge}
                </p>

                <p>
                  <strong>Pickup:</strong>{" "}
                  {order.pickupAddress}
                </p>

                <p>
                  <strong>Drop:</strong>{" "}
                  {order.dropAddress}
                </p>

                {order.assignedAgent && (
                  <p>
                    <strong>Agent:</strong>{" "}
                    {order.assignedAgent?.name ||
                      order.assignedAgent}
                  </p>
                )}

                {order.status === "CREATED" &&
                  user?.role !== "delivery_agent" && (
                    <button
                      onClick={() =>
                        assignAgent(order._id)
                      }
                    >
                      🚚 Auto Assign Nearest Agent
                    </button>
                  )}

                {order.status === "CREATED" && (
                  <button
                    onClick={() =>
                      updateOrderStatus(
                        order._id,
                        "PICKED_UP"
                      )
                    }
                  >
                    📦 Picked Up
                  </button>
                )}

                {order.status === "PICKED_UP" && (
                  <button
                    onClick={() =>
                      updateOrderStatus(
                        order._id,
                        "IN_TRANSIT"
                      )
                    }
                  >
                    🚚 In Transit
                  </button>
                )}

                {order.status === "IN_TRANSIT" && (
                  <button
                    onClick={() =>
                      updateOrderStatus(
                        order._id,
                        "OUT_FOR_DELIVERY"
                      )
                    }
                  >
                    🏠 Out for Delivery
                  </button>
                )}

                {order.status ===
                  "OUT_FOR_DELIVERY" && (
                  <>
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order._id,
                          "DELIVERED"
                        )
                      }
                    >
                      ✅ Delivered
                    </button>

                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order._id,
                          "FAILED"
                        )
                      }
                    >
                      ❌ Failed Delivery
                    </button>
                  </>
                )}

                {order.status === "FAILED" && (
                  <button
                    onClick={() =>
                      rescheduleOrder(order._id)
                    }
                  >
                    📅 Reschedule Delivery
                  </button>
                )}

                {user?.role === "admin" && (
                  <div className="admin-override">
                    <label>
                      👑 Override Status:
                    </label>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(
                          order._id,
                          e.target.value
                        )
                      }
                    >
                      <option value="CREATED">
                        Created
                      </option>

                      <option value="PICKED_UP">
                        Picked Up
                      </option>

                      <option value="IN_TRANSIT">
                        In Transit
                      </option>

                      <option value="OUT_FOR_DELIVERY">
                        Out for Delivery
                      </option>

                      <option value="DELIVERED">
                        Delivered
                      </option>

                      <option value="FAILED">
                        Failed
                      </option>

                      <option value="RESCHEDULED">
                        Rescheduled
                      </option>
                    </select>
                  </div>
                )}

                <button
                  onClick={() =>
                    loadTracking(order._id)
                  }
                >
                  📍 View Tracking
                </button>

                {trackingData.length > 0 && (
                  <div className="tracking-timeline">
                    <h4>
                      📍 Tracking Timeline
                    </h4>

                    {trackingData.map((item) => (
                      <div
                        key={item._id}
                        className="tracking-item"
                      >
                        <strong>
                          {item.status}
                        </strong>

                        <p>
                          {item.remarks ||
                            "Status updated"}
                        </p>

                        <small>
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </main>
      )}
    </div>
  );
}

export default App;