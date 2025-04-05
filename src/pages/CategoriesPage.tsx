
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CategoryManagement from "@/components/category-management";
import { AssetsProvider } from "@/contexts/AssetsContext";

export default function CategoriesPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <AssetsProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="max-w-5xl mx-auto">
              <CategoryManagement />
            </div>
          </main>
        </div>
      </div>
    </AssetsProvider>
  );
}
