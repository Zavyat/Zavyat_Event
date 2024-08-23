import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

function Login() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="card" style={{ width: "40%" }}>
          <div className="card-body">
            <div>
              <img
                src="./images/Zavyat Logo.png"
                alt="logo"
                style={{
                  width: "250px",
                  height: "250px",
                  color: "white",
                }}
              />
            </div>
            <form
              style={{ fontSize: "15px", fontWeight: "bold" }}
              // onSubmit={handleSubmit} // Handle form submission
            >
              <div className="row" style={{ marginBottom: "20px" }}>
                <label htmlFor="inputEmail3" className="col-4 col-form-label">
                  Email :
                </label>
                <div
                  className="col-8"
                  style={{
                    width: "66.66%",
                    alignItems: "center",
                    paddingLeft: "0%",
                    paddingRight: "5%",
                  }}
                >
                  <input
                    type="email"
                    className="form-control"
                    id="inputEmail3"
                    placeholder="Enter your Email"
                    required // Make the input required
                    // value={email}
                    // onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <label
                  htmlFor="inputPassword3"
                  className="col-4 col-form-label"
                >
                  Password :
                </label>
                <div
                  className="col-8"
                  style={{
                    width: "66.66%",
                    alignItems: "center",
                    paddingLeft: "0%",
                    paddingRight: "5%",
                  }}
                >
                  <input
                    type="password"
                    className="form-control"
                    id="inputPassword3"
                    placeholder="Enter your Password"
                    required // Make the input required
                    // value={password}
                    // onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              </div>
              {/* {error && <div style={{ color: "red" }}>{error}</div>} */}
              <div
                className="form-check"
                style={{ textAlign: "center", paddingBottom: "20px" }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="exampleCheck1"
                  style={{ float: "none", marginRight: "10px" }}
                />
                <label className="form-check-label" htmlFor="exampleCheck1">
                  remember me
                </label>
              </div>
              <button type="submit" className="btn signinbutton">
                Login In
              </button>
            </form>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Login;
