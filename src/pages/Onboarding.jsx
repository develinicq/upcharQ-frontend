import axios from "../lib/axios";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Onboarding = ({ onContinue }) => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If OnboardingFlow already handled the logic, we might just be viewing success/details
    // But Onboarding seems designed to fetch itself if rendered standalone.

    // Check if onContinue prop is passed (implies parent control)
    if (onContinue) {
      // If parent passed onContinue, it likely expects to control flow, 
      // but here we are in "fallback" mode if parent rendered us without data?
      // Or maybe parent rendered us FOR gathering data?
      // Let's keep fetching but use cleaner axios.
    }

    const code = searchParams.get("code");
    if (!code) {
      setError("No invitation code provided.");
      setLoading(false);
      return;
    }

    axios.get(`/invitations/checkInvitation`, { params: { code } })
      .then((response) => {
        const result = response.data;
        if (result.success) {
          setData(result.data);
          // If parent provided onContinue callback, use it?
          // onContinue(result.data); 
        } else {
          setError(result.message || "Invalid invitation.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Onboarding fetch error:", err);
        setError("Failed to fetch invitation details.");
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!data) return null;

  const { user, invitation, challengeID } = data;

  return (
    <div style={{ padding: 24 }}>
      <h2>Onboarding Details</h2>
      <h3>User Info</h3>
      <ul>
        <li>Name: {user.firstName} {user.lastName}</li>
        <li>Email: {user.emailId}</li>
        <li>Phone: {user.phone}</li>
        <li>Email Verified: {user.emailIdVerified ? "Yes" : "No"}</li>
        <li>Phone Verified: {user.phoneVerified ? "Yes" : "No"}</li>
        <li>Active: {user.isActive ? "Yes" : "No"}</li>
      </ul>
      <h3>Invitation Info</h3>
      <ul>
        <li>Type: {invitation.type}</li>
        <li>Accepted: {invitation.accepted ? "Yes" : "No"}</li>
        <li>Expires At: {new Date(invitation.expiresAt).toLocaleString()}</li>
      </ul>
      <h3>Challenge IDs</h3>
      <ul>
        <li>Mobile: {challengeID.mobile}</li>
        <li>Email: {challengeID.email}</li>
      </ul>
    </div>
  );
};

export default Onboarding;
