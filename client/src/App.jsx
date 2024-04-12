import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { About, Dashboard, Home, Projects, SignIn, SignUp } from "./pages";
import { Header, PublicRoute, PrivateRoute } from "./components";

export const App = () => {
  return (
    <>
      <BrowserRouter>
        {/* aca va el header, que es el único componente que se va a ver siempre */}
        <Header />
        <Routes>
          {/*   si pongo una ruta mal me redirige a home con el *   */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/" element={<Home />} />

          {/* Solo puedo acceder al dashboard si ESTOY autenticado (PrivateRoute) */}
          <Route element={<PrivateRoute/>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
          </Route>

          {/* Solo puedo acceder a estas rutas si NO ESTOY autenticado (PublicRoute) */}
          <Route element={<PublicRoute />}>
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in" element={<SignIn />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};
