import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const testimonials = [
    {
      text: "StockFlow has transformed how we manage our inventory. The real-time tracking and easy-to-use interface have reduced our stock discrepancies by 90%. It's a game-changer for our retail operations.",
      name: "Sarah Martinez",
      role: "Store Manager",
      avatar: "/images/users/avatar-1.jpg"
    },
    {
      text: "As a cashier, I love how intuitive the POS system is. Processing transactions is lightning-fast, and I can quickly check stock levels without leaving the checkout. It makes my job so much easier.",
      name: "James Cooper",
      role: "Senior Cashier",
      avatar: "/images/users/avatar-2.jpg"
    },
    {
      text: "The inventory management features are outstanding. We can now track products, manage suppliers, and generate reports in minutes instead of hours. StockFlow has streamlined our entire operation.",
      name: "Patricia Anderson",
      role: "Operations Manager",
      avatar: "/images/users/avatar-3.jpg"
    }
  ];

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ username, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setAuth({ token, user });

      if (user.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/cashier/pos');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="authentication-box vh-100 bg-img-4">
      <div className="bg-overlay"></div>
      <div className="container-fluid p-0">
        <div className="row g-0 align-items-center">
          <div className="col-lg-3">
            <div className="bg-white vh-100">
              <div className="row g-0 justify-content-center d-flex vh-100 align-items-center">
                <div className="col-lg-11">
                  <div className="authen-box">
                    <div className="text-center pb-4 mb-2">
                      <img src="/images/logo-dark.png" alt="Logo" height="26" />
                    </div>
                    <div className="auth-contents">
                      <div className="text-center">
                        <h4 className="fw-normal">Welcome to <span className="fw-bold">StockFlow</span></h4>
                        <p className="text-muted">Sign in to manage your inventory.</p>
                      </div>

                      {error && (
                        <div className="alert alert-danger mt-3" role="alert">
                          {error}
                        </div>
                      )}

                      <form className="custom-form mt-4 pt-2" onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label fw-bold f-15">Username</label>
                          <input
                            type="text"
                            className="form-control"
                            id="username"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold f-15">Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mt-4">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="customControlInline"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label
                              className="form-check-label f-14 text-muted fw-bold"
                              htmlFor="customControlInline"
                            >
                              Remember me
                            </label>
                          </div>
                        </div>
                        <div className="text-center mt-3">
                          <button
                            className="btn shadow-none w-100 rounded-pill"
                            style={{ backgroundColor: '#0995c0ff', color: 'white' }}
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? 'Logging in...' : 'Log In'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="row g-0 justify-content-center auth-carousel">
              <div className="col-lg-7">
                <div className="d-none d-lg-inline-block">
                  <div id="carouselExampleIndicators" className="carousel slide">
                    <div className="carousel-inner">
                      {testimonials.map((testimonial, index) => (
                        <div
                          key={index}
                          className={`carousel-item ${index === currentSlide ? 'active' : ''}`}
                        >
                          <div className="testi-contain text-white">
                            <p className="mt-4 pt-2 lh-lg f-20">"{testimonial.text}"</p>
                            <div className="d-flex mt-4 align-items-center">
                              <div className="testi-img">
                                <img
                                  src={testimonial.avatar}
                                  className="me-3 img-fluid avatar-md img-thumbnail rounded-circle"
                                  alt={testimonial.name}
                                />
                              </div>
                              <div className="flex-1 ms-2">
                                <h5 className="mt-0 mb-0 f-19">{testimonial.name}</h5>
                                <p className="mb-0 f-15">
                                  <span
                                    className="me-2"
                                    style={{
                                      display: "inline-block",
                                      width: "8px",
                                      height: "8px",
                                      backgroundColor: "#08c7d1ff",
                                      borderRadius: "50%"
                                    }}
                                  ></span>
                                  {testimonial.role}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="carousel-indicators">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          className={index === currentSlide ? 'active' : ''}
                          aria-current={index === currentSlide ? 'true' : 'false'}
                          aria-label={`Slide ${index + 1}`}
                          onClick={() => setCurrentSlide(index)}
                        ></button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;