import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const VotingContext = createContext();
const API_URL = 'http://localhost:5000/api';
const BASE_URL = 'http://localhost:5000';

export const VotingProvider = ({ children }) => {
  const [parties, setParties] = useState([]);
  const [votes, setVotes] = useState([]);
  const [votingTime, setVotingTime] = useState(null);
  const [resultsAnnounced, setResultsAnnounced] = useState(false);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('currentUser') || 'null'));

  // Load Initial Data from MongoDB
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [partiesRes, votesRes, configRes] = await Promise.all([
        axios.get(`${API_URL}/candidates`),
        axios.get(`${API_URL}/votes`),
        axios.get(`${API_URL}/config`)
      ]);
      setParties(partiesRes.data);
      setVotes(votesRes.data);
      setVotingTime(configRes.data.votingTime);
      setResultsAnnounced(configRes.data.resultsAnnounced);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // --- Auth Actions ---
  const registerVoter = async (formData) => {
    try {
      await axios.post(`${API_URL}/voter/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Registration failed" };
    }
  };

  const getVoterByVoterId = async (voterId) => {
    try {
      const res = await axios.post(`${API_URL}/voter/find-phone`, { voterId });
      return { phone: res.data.phone };
    } catch (err) {
      return null;
    }
  };

  const loginVoter = async (voterId, password) => {
    try {
      const res = await axios.post(`${API_URL}/voter/login`, { voterId, password });
      setCurrentUser({ ...res.data.user, role: 'voter', token: res.data.token });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Login failed" };
    }
  };

  const loginAdmin = async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/admin/login`, { username, password });
      setCurrentUser({ ...res.data.user, token: res.data.token });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Login failed" };
    }
  };

  const loginParty = async (nameOrParty, password) => {
    // For simplicity, reusing voter-like check for parties in this phase
    const party = parties.find(p => (p.name === nameOrParty || p.partyName === nameOrParty) && p.status === 'approved');
    if (party) {
       // In a real app, this would also be an API call
      setCurrentUser({ ...party, role: 'party' });
      return { success: true };
    }
    return { success: false, message: "Invalid credentials or not approved." };
  };

  const logout = () => setCurrentUser(null);

  // --- Election Actions ---
  const registerParty = async (formData) => {
    try {
      await axios.post(`${API_URL}/candidate/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchInitialData();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Application failed" };
    }
  };

  const updatePartyStatus = async (partyId, status) => {
    try {
      await axios.put(`${API_URL}/admin/party/status`, { id: partyId, status });
      await fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  const setElectionTimer = async (days = 3) => {
    try {
      await axios.post(`${API_URL}/admin/timer`, { days });
      await fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  const castVote = async (partyName, voterId, password) => {
    const now = new Date();
    if (!votingTime || now < new Date(votingTime.start) || now > new Date(votingTime.end)) {
      return { success: false, message: "Voting is not active." };
    }

    try {
      await axios.post(`${API_URL}/vote`, { voterId, partyName, password });
      await fetchInitialData();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Vote failed" };
    }
  };

  const announceResults = async () => {
    try {
      await axios.post(`${API_URL}/admin/announce`);
      await fetchInitialData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };



  const value = {
    parties, votes, votingTime, resultsAnnounced, currentUser, BASE_URL,
    registerVoter, loginVoter, loginAdmin, loginParty, logout, getVoterByVoterId,
    registerParty, updatePartyStatus, setElectionTimer, castVote, announceResults
  };

  return <VotingContext.Provider value={value}>{children}</VotingContext.Provider>;
};

export const useVoting = () => useContext(VotingContext);
