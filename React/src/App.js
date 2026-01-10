import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <div>
      <Router>
        <Header />
        <AppRoutes />
        <Footer />
      </Router>
    </div>
  );
}

export default App;
