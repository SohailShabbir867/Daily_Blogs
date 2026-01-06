import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BlogProvider } from "./context/BlogContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BlogDetails from "./pages/BlogDetails";
import SavedBlogs from "./pages/SavedBlogs";
import Contact from "./pages/Contact";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateBlog from "./pages/admin/CreateBlog";
import ManageBlogs from "./pages/admin/ManageBlogs";
import EditBlog from "./pages/admin/EditBlog";
import UserManagement from "./pages/admin/UserManagement";
import ContactsManagement from "./pages/admin/ContactsManagement";
import SendNotifications from "./pages/admin/SendNotifications";

function App() {
  return (
    <AuthProvider>
      <BlogProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            {/* Navbar always visible */}
            <Navbar />

            {/* Page content */}
            <main className="grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/blog/:id" element={<BlogDetails />} />
                <Route path="/saved" element={<SavedBlogs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                
                {/* Password Reset Routes */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Email Verification Route */}
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/create" element={<CreateBlog />} />
                <Route path="/admin/manage" element={<ManageBlogs />} />
                <Route path="/admin/edit/:id" element={<EditBlog />} />
                
                {/* Super Admin Routes */}
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/contacts" element={<ContactsManagement />} />
                <Route path="/admin/notifications" element={<SendNotifications />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </BrowserRouter>
      </BlogProvider>
    </AuthProvider>
  );
}

export default App;
