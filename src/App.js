import React, { useState } from "react";
import "./App.css";
import { PuffLoader } from "react-spinners";

export default function App() {
  const [idcardno, setIdcardno] = useState("");
  const [loading, setLoading] = useState(false);
  const [fName, setFirstName] = useState("");
  const [mName, setMiddleName] = useState("");
  const [lName, setLastName] = useState("");
  const [out, setOut] = useState([]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setOut("");

    if (fName === "" && mName === "" && lName === "" && idcardno === "") {
      alert("Please enter atleast one field");
      setOut([]);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        form: {
          fname: fName,
          mname: mName,
          lname: lName,
          gender: "",
          age: "",
          mobile: "",
          idcardno: idcardno,
          acnos: "140,142,141",
          panel_nos: "17",
          executive_id: "63419",
          recordPerPage: "50",
          pageNo: "1",
        },
        headers: {
          Accept: "application/json, text/plain, */*",
          Http_token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3Mjg5OSwiZXhlY3V0aXZlX2lkIjo2MzQxOSwibG9naW5fbW9kZSI6ImFuZHJvaWQiLCJkYl9tb2RlIjoiTElWRSIsInJvbGVfaWQiOjUsImFwcF9pZCI6MiwiY2xpZW50X2lkIjo3NiwiZWxlY3Rpb25faWQiOjkzLCJzdXBlcl9hZG1pbl9pZCI6NDE3LCJhZGRlZGRhdGUiOiIyMDI2LTAxLTA5IDE2OjM1OjU5LjQwMTUxMyJ9.Ar1wN3YtJKp0+Y/iehGR3MFhtNBJZ12ICEXS4F+i7n4=",
          Origin: "https://digibitsearch.com",
          "sec-fetch-site": "same-site",
          Referer: "https://digibitsearch.com/pwa-umc/voter-search",
        },
      };

      const res = await fetch("https://voters-api.vercel.app/proxy/mhvoter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      try {
        const response = await res.json();
        setOut(response.voters);
      } catch (err) {
        setOut([]);
      }
    } catch (err) {
      setOut([]);
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <img
        className="header_img"
        src="https://res.cloudinary.com/ronaklala-games/image/upload/v1767966952/52aa4c2a-c89f-4129-8903-57e857dd3364_oige4u.jpg"
      />

      <form onSubmit={submit} className="form">
        <label className="row">
          <span>ID Card</span>
          <input
            value={idcardno}
            onChange={(e) => setIdcardno(e.target.value)}
            placeholder="Enter idcardno (e.g. YDE6209670)"
          />
        </label>

        <label className="row">
          <span>First Name</span>
          <input
            value={fName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="नाव / First Name"
          />
        </label>

        <label className="row">
          <span>Middle Name</span>
          <input
            value={mName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="मधले नाव / Middle Name"
          />
        </label>

        <label className="row">
          <span>Last Name</span>
          <input
            value={lName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="आडनाव / Last Name"
          />
        </label>

        <button className="btn" disabled={loading}>
          Search
        </button>
      </form>

      {loading && (
        <center>
          <div className="loader">
            <PuffLoader color="#000000" loading={loading} size={150} />
          </div>
        </center>
      )}

      {out.length > 0 &&
        out.map((voter, i) => (
          <section key={i}>
            <h3>Voter {i + 1}</h3>
            <div className="voter">
              <img src="https://res.cloudinary.com/ronaklala-games/image/upload/v1767966952/b4089d3a-4c1f-4c7f-b626-9b6684e1892d_qkmdwt.jpg" />
              <p>
                <b>Name:</b> {voter.fullname} {voter.mname} {voter.lname}
              </p>
              <p>
                <b>Booth:</b> {voter.boothname}
              </p>

              <p>
                <b>Kendra:</b> {voter.kendra_name}
              </p>

              <p>
                <b>Kendra in Marathi:</b> {voter.kendra_name_mar}
              </p>
            </div>
          </section>
        ))}
    </div>
  );
}
