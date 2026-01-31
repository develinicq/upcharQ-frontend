import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("No invitation code provided.");
      setLoading(false);
      return;
    }
    fetch(`/api/invitations/checkInvitation?code=${code}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || "Invalid invitation.");
        }
        setLoading(false);
      })
      .catch(() => {
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
