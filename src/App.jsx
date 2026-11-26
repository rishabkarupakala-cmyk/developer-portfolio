import { fetchCollection, getStrapiImage } from "./api.js";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function toText(value) {
  if (value == null) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    if (value.text != null) return toText(value.text);
    if (value.children != null) return toText(value.children);
    if (value.name != null) return toText(value.name);
    if (value.Title != null) return toText(value.Title);
    if (value.title != null) return toText(value.title);
  }

  return "";
}

function getField(item, ...keys) {
  for (const key of keys) {
    const value = toText(item?.[key]);
    if (value) return value;
  }

  return "";
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [pointer, setPointer] = useState({ x: 50, y: 35 });
const [selectedProject, setSelectedProject] = useState(null);
const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef(null);
useEffect(() => {
  const updateProgress = () => {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress =
      scrollableHeight > 0
        ? (window.scrollY / scrollableHeight) * 100
        : 0;

    setScrollProgress(progress);
  };

  updateProgress();

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  return () => {
    window.removeEventListener("scroll", updateProgress);
    window.removeEventListener("resize", updateProgress);
  };
}, []);
  useEffect(() => {
    let active = true;

    async function loadData() {
      const results = await Promise.allSettled([
        fetchCollection("projects"),
        fetchCollection("skills"),
        fetchCollection("experiences"),
      ]);

      if (!active) return;

      if (results[0].status === "fulfilled") {
        setProjects(
          Array.isArray(results[0].value) ? results[0].value : []
        );
      } else {
        setError(
          results[0].reason?.message ||
            "Unable to load projects from Strapi."
        );
      }

      if (results[1].status === "fulfilled") {
        setSkills(
          Array.isArray(results[1].value) ? results[1].value : []
        );
      }

      if (results[2].status === "fulfilled") {
        setExperiences(
          Array.isArray(results[2].value) ? results[2].value : []
        );
      }

      setLoading(false);
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // GSAP animations


  // Additive cinematic navigation wipe; existing anchors and page structure stay intact.
  useEffect(() => {
    const overlay = document.querySelector(".cinematic-nav-wipe");
    const links = document.querySelectorAll(".nav-links a[href^='#']");
    if (!overlay || !links.length) return;

    let isTransitioning = false;
    const handlers = [];

    links.forEach((link) => {
      const handleClick = (event) => {
        const href = link.getAttribute("href");
        const target = href ? document.querySelector(href) : null;
        if (!target || isTransitioning) return;

        event.preventDefault();
        isTransitioning = true;

        gsap.killTweensOf(overlay);
        gsap.set(overlay, { yPercent: 100, autoAlpha: 1 });

        gsap.timeline({
          defaults: { ease: "power4.inOut" },
          onComplete: () => {
            isTransitioning = false;
            window.location.hash = href;
          },
        })
          .to(overlay, { yPercent: 0, duration: 0.48 })
          .add(() => {
            window.scrollTo({
              top: target.getBoundingClientRect().top + window.scrollY,
              behavior: "auto",
            });
          })
          .to(overlay, { yPercent: -100, duration: 0.58 })
          .set(overlay, { autoAlpha: 0, yPercent: 100 });
      };

      link.addEventListener("click", handleClick);
      handlers.push(() => link.removeEventListener("click", handleClick));
    });

    return () => {
      handlers.forEach((remove) => remove());
      gsap.killTweensOf(overlay);
    };
  }, []);

  // Additional section reveals complement the existing hero/project/about animations.
  useGSAP(() => {
    const motion = gsap.matchMedia();

    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ".section-heading, .experience-section .section-heading, .footer-eyebrow",
        { y: 32, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { start: "top 88%", once: true },
        }
      );

      gsap.fromTo(
        ".experience-item, .footer-side",
        { y: 38, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".experience-section", start: "top 82%", once: true },
        }
      );
    });

    return () => motion.revert();
  }, { scope: heroRef });

  useGSAP(
    () => {
      const motion = gsap.matchMedia();

      motion.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          // Hero eyebrow
          gsap.fromTo(
            ".hero-eyebrow",
            {
              y: 12,
              autoAlpha: 0,
            },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.6,
              ease: "power2.out",
            }
          );

          // Hero heading
          
const headline = heroRef.current?.querySelector(".hero h1");

if (headline) {
  

  headline.innerHTML = `
    <span class="hero-line">
      <span class="hero-word">Building</span>
      <span class="hero-word">digital</span>
    </span>
    <span class="hero-line">
      <span class="hero-word">experiences</span>
      <span class="hero-word">that</span>
      <span class="hero-word hero-highlight">matter.</span>
    </span>
  `;

  gsap.fromTo(
    headline.querySelectorAll(".hero-word"),
    {
      yPercent: 110,
      autoAlpha: 0,
    },
    {
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.9,
      stagger: 0.13,
      delay: 0.12,
      ease: "power4.out",
    }
  );


gsap.fromTo(
  ".experience-card",
  {
    y: 50,
    autoAlpha: 0,
  },
  {
    y: 0,
    autoAlpha: 1,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".experience-columns",
      start: "top 80%",
      once: true,
    },
  }
);


  gsap.fromTo(
    headline.querySelector(".hero-highlight"),
    { textShadow: "0 0 0px rgba(139, 92, 246, 0)" },
    {
      textShadow: "0 0 28px rgba(139, 92, 246, 0.45)",
      duration: 0.8,
      delay: 0.85,
      ease: "power2.out",
    }
  );
}


          // Hero bottom elements
          gsap.fromTo(
            ".hero-bottom, .hero-index",
            {
              y: 16,
              autoAlpha: 0,
            },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              stagger: 0.15,
              delay: 0.35,
              ease: "power2.out",
            }
          );

          // About section reveal
          const aboutSection =
            heroRef.current?.querySelector("[data-about-section]");

          if (aboutSection) {
            const aboutTitle =
              aboutSection.querySelector("[data-about-title]");

            const aboutCopy =
              aboutSection.querySelector("[data-about-copy]");

            const aboutLink =
              aboutSection.querySelector("[data-about-link]");

            const aboutElements = [
              aboutTitle,
              aboutCopy,
              aboutLink,
            ].filter(Boolean);

            gsap.fromTo(
              aboutElements,
              {
                y: 65,
                autoAlpha: 0,
              },
              {
                y: 0,
                autoAlpha: 1,
                duration: 1.1,
                stagger: 0.25,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: aboutSection,
                  start: "top 75%",
                  once: true,
                },
              }
            );
          }

          // Project cards reveal
          gsap.fromTo(
            "[data-project-card]",
            {
              y: 80,
              autoAlpha: 0,
              scale: 0.96,
            },
            {
              y: 0,
              autoAlpha: 1,
              scale: 1,
              duration: 1,
              stagger: 0.22,
              ease: "power3.out",
              scrollTrigger: {
                trigger: "[data-project-grid]",
                start: "top 90%",
                once: true,
              },
            }
          );
        }
      );

      return () => motion.revert();
    },
    { scope: heroRef }
  );


gsap.fromTo(
  ".skill-item",
  {
    y: 35,
    autoAlpha: 0,
  },
  {
    y: 0,
    autoAlpha: 1,
    duration: 0.65,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".skills-grid",
      start: "top 85%",
      once: true,
    },
  }
);


  return (
      <>
    {/* Additive full-screen transition layer for cinematic nav wipes */}
    <div className="cinematic-nav-wipe" aria-hidden="true" />

    {/* Scroll progress bar */}
    <div
      className="scroll-progress"
      aria-hidden="true"
      style={{
        transform: `scaleX(${scrollProgress / 100})`,
      }}
    />

    <main ref={heroRef}>
      {/* Navigation */}
      <nav className="nav container">
        <a className="brand" href="#home">
          RISHAB K DEEPAK<span>.</span>
        </a>

        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#skills">Skills</a>
          <a href="#about">About</a>
          <a className="nav-contact" href="#contact">
            Let's talk ↗
          </a>
        </div>
      </nav>


{/* Hero */}
<section
  className="hero container"
  id="home"
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setPointer({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }}
  style={{
    "--pointer-x": `${pointer.x}%`,
    "--pointer-y": `${pointer.y}%`,
  }}
>
  <div className="eyebrow hero-eyebrow">
    <span className="status-dot" />
    DEVELOPER PORTFOLIO
  </div>

  <h1>
    Building digital
    <br />
    experiences that <span>matter.</span>
  </h1>

  <div className="hero-bottom">
    <p>
      I build thoughtful digital products through development,
      experimentation, and design.
    </p>

    <div className="hero-actions">
      <a className="hero-primary" href="#work">
        View my work <span>↗</span>
      </a>

      <a className="hero-secondary" href="/resume.pdf" download>
        Download resume <span>↓</span>
      </a>
    </div>
  </div>

  <div className="hero-index">
    <span>INDEPENDENT DEVELOPER</span>
    <span>BASED IN INDIA · OPEN TO OPPORTUNITIES</span>
  </div>
</section>


      {/* Selected projects */}
      <section className="section container" id="work">
        <div className="section-heading">
          <div>
            <span className="section-number">01 / SELECTED WORK</span>
            <h2>
              Things I've built<span>.</span>
            </h2>
          </div>

          <span className="section-count">
            {loading ? "LOADING..." : `${projects.length} PROJECTS`}
          </span>
        </div>

        {loading && (
          <p className="message">Loading projects from Strapi...</p>
        )}

        {error && (
          <div className="message error">
            <strong>Couldn't load projects.</strong>
            <p>{error}</p>
            <p>Check that Strapi is running at http://localhost:1337.</p>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <p className="message">
            No published projects found. Publish a project in Strapi
            Content Manager and refresh this page.
          </p>
        )}

        <div className="project-grid" data-project-grid>
          {projects.map((project, index) => {
            const title =
              getField(project, "Title", "title", "name") ||
              "Untitled project";

            const description =
              getField(
                project,
                "description",
                "Description",
                "summary"
              ) || "A project built with care.";

            const category =
              getField(project, "category", "Category", "slug") ||
              "DEVELOPMENT";

            const liveUrl = getField(project, "liveUrl", "liveURL");
            const githubUrl = getField(project, "githubUrl", "githubURL");

            const technologies = project.technologies;

            const technologyList = Array.isArray(technologies)
              ? technologies.map(toText).filter(Boolean)
              : typeof technologies === "string"
                ? technologies
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                : [];

            const media =
              project.cover ||
              project.image ||
              project.thumbnail ||
              project.featuredImage;

            const image = getStrapiImage(media);

            return (
              
<article
  className="project-card"
  data-project-card
  key={project.documentId || project.id || index}
  onMouseMove={(e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    card.style.setProperty("--mouse-x", `${x * 100}%`);
    card.style.setProperty("--mouse-y", `${y * 100}%`);
    card.style.setProperty("--tilt-x", `${(0.5 - y) * 4}deg`);
    card.style.setProperty("--tilt-y", `${(x - 0.5) * 4}deg`);
  }}
  onMouseLeave={(e) => {
    const card = e.currentTarget;

    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  }}
 
  onClick={() => setSelectedProject(project)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedProject(project);
    }
  }}
  tabIndex={0}
  role="button"
>

                <div className={`project-visual visual-${index % 3}`}>
                  {image ? (
                    <img src={image} alt={title} loading="lazy" />
                  ) : (
                    <div className="visual-placeholder">
                      <span className="visual-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="visual-caption">
                        SELECTED PROJECT
                      </span>

                      <span className="visual-icon">{"</>"}</span>
                    </div>
                  )}

                  {liveUrl && (
                    <a
                      className="project-open"
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${title}`}
                    >
                      ↗
                    </a>
                  )}
                </div>

                <div className="project-meta">
                  <span>
                    PROJECT {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{category}</span>
                </div>

                <h3>{title}</h3>
                <p>{description}</p>

                {technologyList.length > 0 && (
                  <div
                    className="tech-list"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginTop: "10px",
                    }}
                  >
                    {technologyList.map((technology, techIndex) => (
                      <span key={`${technology}-${techIndex}`}>
                        {technology}
                      </span>
                    ))}
                  </div>
                )}

                {githubUrl && (
                  <a
                    className="text-link"
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source ↗
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </section>

{selectedProject && (
  <div
    className="project-modal-backdrop"
    onClick={() => setSelectedProject(null)}
    onKeyDown={(e) => {
      if (e.key === "Escape") setSelectedProject(null);
    }}
  >
    <div
      className="project-modal"
      role="dialog"
      aria-modal="true"
      aria-label={getField(
        selectedProject,
        "Title",
        "title",
        "name"
      ) || "Project details"}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="project-modal-close"
        onClick={() => setSelectedProject(null)}
        aria-label="Close project details"
      >
        ×
      </button>

      <span className="section-number">PROJECT DETAILS</span>

      <h2>
        {getField(
          selectedProject,
          "Title",
          "title",
          "name"
        ) || "Untitled project"}
      </h2>

      <p>
        {getField(
          selectedProject,
          "description",
          "Description",
          "summary"
        ) || "A project built with care."}
      </p>

      {(() => {
        const media =
          selectedProject.cover ||
          selectedProject.image ||
          selectedProject.thumbnail ||
          selectedProject.featuredImage;

        const image = getStrapiImage(media);

        return image ? (
          <img
            className="project-modal-image"
            src={image}
            alt={getField(
              selectedProject,
              "Title",
              "title",
              "name"
            ) || "Project preview"}
          />
        ) : null;
      })()}

      <div className="project-modal-actions">
        {getField(selectedProject, "liveUrl", "liveURL") && (
          <a
            className="hero-primary"
            href={getField(selectedProject, "liveUrl", "liveURL")}
            target="_blank"
            rel="noreferrer"
          >
            Live demo ↗
          </a>
        )}

        {getField(selectedProject, "githubUrl", "githubURL") && (
          <a
            className="hero-secondary"
            href={getField(selectedProject, "githubUrl", "githubURL")}
            target="_blank"
            rel="noreferrer"
          >
            View source ↗
          </a>
        )}
      </div>
    </div>
  </div>
)}


      
{/* Skills */}
<section className="section skills-section" id="skills">
  <div className="container">
    <div className="section-heading">
      <div>
        <span className="section-number">02 / TOOLKIT</span>
        <h2>
          Tools of the trade<span>.</span>
        </h2>
      </div>

      <span className="heading-icon" aria-hidden="true">✳</span>
    </div>

    <div className="skills-grid">
      {(skills.length
        ? skills
        : [
            "JavaScript",
            "React",
            "HTML & CSS",
            "Node.js",
            "REST APIs",
            "Git",
          ]
      ).map((skill, index) => {
        const name =
          typeof skill === "string"
            ? skill
            : getField(
                skill,
                "name",
                "title",
                "Title",
                "skillName"
              ) || "Skill";

        const normalizedName = name.toLowerCase();

        const symbol = normalizedName.includes("react")
          ? "⚛"
          : normalizedName.includes("typescript")
            ? "TS"
            : normalizedName.includes("javascript")
              ? "JS"
              : normalizedName.includes("html") ||
                  normalizedName.includes("css")
                ? "◇"
                : normalizedName.includes("node")
                  ? "⬡"
                  : normalizedName.includes("sql")
                    ? "▤"
                    : normalizedName.includes("git")
                      ? "⑂"
                      : normalizedName.includes("api")
                        ? "</>"
                        : "✳";

        return (
          <article
            className="skill-item"
            key={
              typeof skill === "object"
                ? skill.documentId || skill.id || `${name}-${index}`
                : `${name}-${index}`
            }
          >
            <div className="skill-card-top">
              <span className="skill-icon" aria-hidden="true">
                {symbol}
              </span>
              <span className="skill-index">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="skill-card-bottom">
              <h3>{name}</h3>
              <span className="skill-arrow" aria-hidden="true">
                ↗
              </span>
            </div>

            <span className="skill-card-glow" aria-hidden="true" />
          </article>
        );
      })}
    </div>

    {skills.length === 0 && (
      <p className="section-note">
        Example skills are shown until you publish skills in Strapi.
      </p>
    )}
  </div>
</section>


     
      {/* About */}
      <section
        className="section container about-section"
        id="about"
        data-about-section
      >
        <span className="section-number">03 / ABOUT</span>

        <div className="about-layout">
          <h2 data-about-title>
            Curious by nature.
            <br />
            <span>Intentional by design.</span>
          </h2>

          <div className="about-copy">
            <span className="about-sparkle">✳</span>

            <p data-about-copy>
              I turn ideas into considered digital products through
              thoughtful design, solid engineering, and continuous
              learning.
            </p>

            <a className="text-link" href="#contact" data-about-link>
              Get in touch ↘
            </a>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="experience-section" id="experience">
        <div className="container">
          <div className="experience-intro">
            <div>
              <span className="section-number">04 / EXPERIENCE</span>
              <h2>
                Where I've <span>worked.</span>
              </h2>
            </div>

            <p>
              The roles and experiences shaping my journey as a developer.
            </p>
          </div>

          {experiences.length > 0 ? (
            <div className="experience-columns">
              {["Internship", "Job"].map((type) => {
                const entries = experiences
                  .filter(
                    (item) =>
                      (item.type || "").toLowerCase() ===
                      type.toLowerCase()
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.StartDate || b.startDate || 0) -
                      new Date(a.StartDate || a.startDate || 0)
                  );

                return (
                  <div className="experience-group" key={type}>
                    <div className="experience-group-heading">
                      <h3>
                        {type === "Internship" ? "Internships" : "Jobs"}
                        <span>.</span>
                      </h3>

                      <span className="experience-count">
                        {String(entries.length).padStart(2, "0")} ROLES
                      </span>
                    </div>

                    {entries.length > 0 ? (
                      <div className="experience-cards">
                        {entries.map((item, index) => {
                          const start = item.StartDate || item.startDate;
                          const end = item.current
                            ? null
                            : item.EndDate || item.endDate;

                          const formatDate = (date) => {
                            if (!date) return "";

                            const parsed = new Date(date);
                            if (Number.isNaN(parsed.getTime())) return "";

                            return parsed.toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                              timeZone: "UTC",
                            });
                          };

                          const startLabel = formatDate(start);
                          const endLabel = item.current
                            ? "Present"
                            : formatDate(end);

                          return (
                            <article
                              className="experience-card"
                              key={item.documentId || item.id || index}
                            >
                              <div className="experience-card-top">
                                <span className="experience-card-number">
                                  EXPERIENCE / {String(index + 1).padStart(2, "0")}
                                </span>

                                {item.current && (
                                  <span className="experience-current">
                                    <span className="experience-status-dot" />
                                    Current
                                  </span>
                                )}
                              </div>

                              <h4>
                                {getField(item, "role", "title") ||
                                  "Experience"}
                              </h4>

                              <p className="experience-company">
                                {getField(item, "organization", "company")}
                              </p>

                              {getField(item, "description", "summary") && (
                                <p className="experience-description">
                                  {getField(item, "description", "summary")}
                                </p>
                              )}

                              <div className="experience-card-footer">
                                <span>
                                  {startLabel}
                                  {startLabel && endLabel ? " — " : ""}
                                  {endLabel}
                                </span>
                                <span className="experience-card-arrow">↗</span>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="experience-empty">
                        <span className="experience-empty-mark">✳</span>
                        <p>No {type.toLowerCase()} roles yet.</p>
                        <span>More to come.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="experience-empty experience-empty-wide">
              <p>No experience published yet.</p>
              <span>Publish experience entries in Strapi to display them here.</span>
            </div>
          )}
        </div>
      </section>


      
      {/* Footer / Contact */}
      <footer className="footer" id="contact">
        <div className="container">
          <div className="footer-eyebrow">
            <span className="footer-eyebrow-dot" />
            AVAILABLE FOR THE RIGHT OPPORTUNITY
          </div>

          <div className="footer-hero">
            <h2>
              Let's make
              <br />
              something
              <br />
              <span>remarkable.</span>
            </h2>

            <div className="footer-side">
              <span className="footer-side-index">LET'S CONNECT — 2026</span>

              <p>
                Good ideas deserve thoughtful design and great engineering.
                Have something in mind? Let's bring it to life.
              </p>

              <a
                className="footer-cta"
                href="mailto:rishab.karupakala@gmail.com"
              >
                <span>Start a conversation</span>
                <span className="footer-cta-icon">↗</span>
              </a>

              <span className="footer-email-caption">
                OR EMAIL ME DIRECTLY
              </span>

              <a
                className="footer-direct-email"
                href="mailto:rishab.karupakala@gmail.com"
              >
                rishab.karupakala@gmail.com
              </a>
            </div>
          </div>

          <div className="footer-orbit" aria-hidden="true">
            <span>DESIGN</span>
            <span className="footer-orbit-star">✳</span>
            <span>DEVELOP</span>
            <span className="footer-orbit-star">✳</span>
            <span>ITERATE</span>
          </div>

          <div className="footer-bottom">
            <a className="brand footer-brand" href="#home">
              RISHAB K DEEPAK<span>.</span>
            </a>

            <span className="footer-credit">
              INDEPENDENTLY BUILT · 2026
            </span>

            <nav className="footer-socials" aria-label="Social links">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
              >
                GitHub <span>↗</span>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <span>↗</span>
              </a>

              <a href="mailto:rishab.karupakala@gmail.com">
                Email <span>↗</span>
              </a>
            </nav>
          </div>
        </div>
      </footer>

    </main>
    </>
  );
}