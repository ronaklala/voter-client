import React, { useState } from "react";
import "./App.css";
import WhatsAppSVG from "./whatsapp-svgrepo-com.svg";
import DownloadSVG from "./download-minimalistic-svgrepo-com.svg";
import html2canvas from "html2canvas";
import Lottie from "lottie-react";
import bowAnimation from "./bow.json";

export default function App() {
  const [idcardno, setIdcardno] = useState("");
  const [loading, setLoading] = useState(false);
  const [fName, setFirstName] = useState("");
  const [mName, setMiddleName] = useState("");
  const [lName, setLastName] = useState("");
  const [out, setOut] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [serch, setSearch] = useState("");

  const filteredOut = Array.isArray(out)
    ? out.filter((v) => {
        // 🔹 if search box is empty → show all results
        if (!serch.trim()) return true;

        const q = serch.toLowerCase();

        const first = (v.fullname || "").toLowerCase();
        const middle = (v.mname || "").toLowerCase();
        const last = (v.lname || "").toLowerCase();

        const combined = `${first} ${middle} ${last}`;

        return (
          first.includes(q) ||
          middle.includes(q) ||
          last.includes(q) ||
          combined.includes(q)
        );
      })
    : [];

  const downloadCard = async (e, filename = "voter.png") => {
    const originalCard = e.currentTarget
      .closest("section")
      .querySelector(".voter");

    if (!originalCard) {
      console.error("Could not find .voter element near this button");
      return;
    }

    // 1) Offscreen wrapper
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-10000px";
    wrapper.style.top = "0";
    wrapper.style.width = originalCard.offsetWidth
      ? `${originalCard.offsetWidth}px`
      : "600px";
    wrapper.style.background = "#fff";
    wrapper.style.padding = "14px";
    wrapper.style.fontFamily = "Arial, sans-serif";

    // 2) Optional top content (keep / remove as needed)

    // 3) Clone card
    const clone = originalCard.cloneNode(true);

    // 4) Force banner visible + smaller height
    const banner = clone.querySelector("img");
    if (banner) {
      banner.style.display = "block";
      banner.style.visibility = "visible";
      banner.style.opacity = "1";
      banner.style.width = "500px";
      banner.style.height = "550px"; // 🔹 smaller height
      banner.style.objectFit = "contain"; // keep aspect ratio
      banner.style.marginBottom = "6px";
      banner.setAttribute("crossorigin", "anonymous");
    }

    // 5) Insert two separator lines BELOW the image
    const separators = document.createElement("div");
    separators.innerHTML = `
      <hr style="border:none; border-top:2px solid #000; margin:4px 0;" />
      <hr style="border:none; border-top:1px solid #000; margin:4px 0 10px 0;" />
    `;

    if (banner && banner.parentNode) {
      banner.parentNode.insertBefore(separators, banner.nextSibling);
    }

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      // 7) Capture
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Blob null (CORS/tainted canvas)");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      // 8) Cleanup
      wrapper.remove();
    }
  };

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setDataFetched(false);
    setOut("");

    if (fName === "" && mName === "" && lName === "" && idcardno === "") {
      alert("Please enter atleast one field");
      setOut([]);
      setLoading(false);
      return;
    }

    try {
      setSearch("");
      setLastName("");
      setFirstName("");
      setIdcardno("");
      setMiddleName("");
      const payload = {
        form: {
          ...(!lName.trim() && !mName.trim()
            ? { advance_search: fName }
            : { fname: fName }),
          mname: mName,
          ...(!fName.trim() && !mName.trim()
            ? { advance_search: lName }
            : { lname: lName }),
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
      setDataFetched(true);
      setLoading(false);
    }
  }

  return (
    <React.Fragment>
      <div className="header">
        <center>Panel 17 - Voter Search</center>
      </div>
      <div className="wrap">
        <center>
          <div className="flex-row center">
            <div className="count_box">0</div>
            <div className="count_box">0</div>
            <div className="count_box">2</div>
            <div className="count_box">4</div>
            <div className="count_box">4</div>
            <div className="count_box">8</div>

            <a
              href="https://api.whatsapp.com/send?text=https://voterconnect-17.vercel.app/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="btn">
                Share <img alt="whatsapp_svg" src={WhatsAppSVG} />
              </div>
            </a>
          </div>
        </center>
        <br />
        <img
          className="header_img"
          src="https://res.cloudinary.com/ronaklala-games/image/upload/v1767966952/b4089d3a-4c1f-4c7f-b626-9b6684e1892d_qkmdwt.jpg"
          alt="Header_banner"
        />
        <br />
        <br />
        <div class="alert alert-warning rajyog-background" role="alert">
          <h4 class="electionInfo text-white text-center m-0">प्रभाग - 17</h4>
        </div>

        <br />

        <form onSubmit={submit} className="form">
          <input
            value={idcardno}
            onChange={(e) => setIdcardno(e.target.value)}
            placeholder="Enter Voter ID Card No (e.g. YDE6209670)"
          />

          <center>OR</center>

          <input
            value={fName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="नाव / First Name"
          />

          <input
            value={mName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="मधले नाव / Middle Name"
          />

          <input
            value={lName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="आडनाव / Last Name"
          />

          <button className="btn" disabled={loading}>
            Search
          </button>
        </form>

        {loading && (
          <center>
            <section className="full-page">
              <div className="loader vertical">
                <Lottie animationData={bowAnimation} loop={true} />
              </div>
            </section>
          </center>
        )}

        {dataFetched && out && out.length === 0 && (
          <center>
            <img
              alt="not_found"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUMRVdGbTxSVPpW5xBc4Q4oJ34LuovWrdhNA&s"
            />
            <h2>No Such Voter Found in Ward 17.</h2>
          </center>
        )}
        <br />
        <br />
        <div className="voters">
          {out.length > 0 && (
            <input
              value={serch}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by first / middle / last name..."
            />
          )}
          {filteredOut.length > 0 &&
            filteredOut.map(
              (voter, i) =>
                voter.boothname !== "" &&
                voter.kendra_name !== "" &&
                voter.kendra_name_mar !== "" && (
                  <section key={i} style={{ padding: "15px" }}>
                    <br />
                    <div className="voter">
                      <img
                        alt="voter_banner"
                        style={{ display: "none" }}
                        src="https://res.cloudinary.com/ronaklala-games/image/upload/v1767966952/52aa4c2a-c89f-4129-8903-57e857dd3364_oige4u.jpg"
                      />
                      <h3>
                        <b>
                          {voter.fullname} {voter.mname} {voter.lname} -{" "}
                          {voter.idcard_no}
                        </b>
                      </h3>
                      <br />
                      <p>
                        <b>Booth:- </b> {voter.boothname}
                      </p>
                      <br />
                      <p>
                        <b>Kendra:- </b> {voter.kendra_name}
                      </p>
                      <br />
                      <p>
                        <b>Kendra in Marathi:- </b> {voter.kendra_name_mar}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn"
                      onClick={(e) =>
                        downloadCard(
                          e,
                          `voter-${voter.idcard || voter.epic_no || i + 1}.png`
                        )
                      }
                    >
                      <img alt="download_svg" src={DownloadSVG} /> Download
                    </button>
                  </section>
                )
            )}
        </div>
      </div>
      <div className="footer">© 2026 - Made By Ronak Ashok lala</div>
    </React.Fragment>
  );
}
