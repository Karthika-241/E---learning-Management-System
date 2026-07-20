import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CourseListing from "./pages/CourseListing";
import CourseDetail from "./pages/CourseDetail";
import MyLearning from "./pages/MyLearning";
import CoursePlayer from "./pages/CoursePlayer";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import Quiz from "./pages/Quiz";
import Certificate from "./pages/Certificate";
import BecomeInstructor from "./pages/BecomeInstructor";
import { useCurrentUser } from "./context/CurrentUserContext";
import Spinner from "./components/Spinner";

export default function App() {
  const { loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner label="Setting things up…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseListing />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/my-learning" element={<MyLearning />} />
          <Route path="/learn/:id" element={<CoursePlayer />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/instructor/new" element={<CreateCourse />} />
          <Route path="/instructor/edit/:id" element={<EditCourse />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/certificate/:id" element={<Certificate />} />
          <Route path="/become-instructor" element={<BecomeInstructor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-4xl mb-3">🧭</p>
      <h1 className="font-display text-xl font-bold">Page not found</h1>
    </div>
  );
}
