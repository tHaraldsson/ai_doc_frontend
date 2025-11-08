import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import "./logout-button.css";  

export function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log("Initiating logout...");
      await logout(); 
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="logout-button"
    >
      Logout
    </button>
  );
}