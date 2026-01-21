import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { ModeratorDashboard } from "@/components/dashboards/ModeratorDashboard";
import { TeacherDashboard } from "@/components/dashboards/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { initializeLocalStorage } from "@/lib/initializeLocalStorage";

describe("Dashboard Components", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    // Initialize local storage before each test
    initializeLocalStorage();
  });

  describe("Admin Dashboard", () => {
    it("should render without errors", () => {
      render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <AdminDashboard />
            </AuthProvider>
          </QueryClientProvider>
        </MemoryRouter>
      );

      // Check that the dashboard renders
      expect(screen.getByText("Lumora Admin Dashboard")).toBeInTheDocument();
    });

    it("should handle tab changes", async () => {
      render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <AdminDashboard />
            </AuthProvider>
          </QueryClientProvider>
        </MemoryRouter>
      );

      // Check that we can find tab buttons
      const schoolsTab = screen.getByText("Schools");
      expect(schoolsTab).toBeInTheDocument();

      // Click on schools tab
      fireEvent.click(schoolsTab);

      // Wait for tab to change
      await waitFor(() => {
        expect(screen.getByText("Manage educational institutions")).toBeInTheDocument();
      });
    });
  });

  describe("Moderator Dashboard", () => {
    it("should render without errors", () => {
      render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ModeratorDashboard />
            </AuthProvider>
          </QueryClientProvider>
        </MemoryRouter>
      );

      // Check that the dashboard renders
      expect(screen.getByText("Lumora Moderator Dashboard")).toBeInTheDocument();
    });
  });

  describe("Teacher Dashboard", () => {
    it("should render without errors", () => {
      render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <TeacherDashboard />
            </AuthProvider>
          </QueryClientProvider>
        </MemoryRouter>
      );

      // Check that the dashboard renders
      expect(screen.getByText("Lumora Teacher Dashboard")).toBeInTheDocument();
    });
  });

  describe("Student Dashboard", () => {
    it("should render without errors", () => {
      render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <StudentDashboard />
            </AuthProvider>
          </QueryClientProvider>
        </MemoryRouter>
      );

      // Check that the dashboard renders
      expect(screen.getByText("Lumora Student Dashboard")).toBeInTheDocument();
    });
  });
});