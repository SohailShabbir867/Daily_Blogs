import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { BlogProvider } from "./context/BlogContext";
import { ChatProvider } from "./context/ChatContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/Chat/ChatWidget";

// Critical pages - loaded eagerly for fast first paint
import Home from "./pages/Home";
import BlogDetails from "./pages/BlogDetails";

// Lazy-loaded pages - loaded on demand for smaller initial bundle
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const SavedBlogs = lazy(() => import("./pages/SavedBlogs"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages - lazy loaded (only needed by admins)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const CreateBlog = lazy(() => import("./pages/admin/CreateBlog"));
const ManageBlogs = lazy(() => import("./pages/admin/ManageBlogs"));
const EditBlog = lazy(() => import("./pages/admin/EditBlog"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ContactsManagement = lazy(
  () => import("./pages/admin/ContactsManagement"),
);
const SendNotifications = lazy(() => import("./pages/admin/SendNotifications"));

// Lightweight loading fallback for route transitions
const PageLoader = () => (
  <div
    className="min-h-[60vh] flex items-center justify-center"
    role="status"
    aria-label="Loading page"
  >
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BlogProvider>
          <ChatProvider>
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                {/* Navbar always visible */}
                <Navbar />

                {/* Page content */}
                <main className="grow">
                  <Suspense fallback={<PageLoader />}>
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
                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />
                      <Route path="/verify-otp" element={<VerifyOTP />} />
                      <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                      />

                      {/* Email Verification Route */}
                      <Route
                        path="/verify-email/:token"
                        element={<VerifyEmail />}
                      />

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/create" element={<CreateBlog />} />
                      <Route path="/admin/manage" element={<ManageBlogs />} />
                      <Route path="/admin/edit/:id" element={<EditBlog />} />

                      {/* Super Admin Routes */}
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route
                        path="/admin/contacts"
                        element={<ContactsManagement />}
                      />
                      <Route
                        path="/admin/notifications"
                        element={<SendNotifications />}
                      />

                      {/* 404 catch-all */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>

                {/* Footer */}
                <Footer />

                {/* Chat Widget - available on all pages */}
                <ChatWidget />
              </div>
            </BrowserRouter>
          </ChatProvider>
        </BlogProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
