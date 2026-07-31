/* eslint-disable @next/next/no-img-element -- art-pack paths are runtime manifest data */
import Link from "next/link";
import type { CSSProperties } from "react";
import type { ArtPack, CharacterMood } from "../../shared/art-pack";

const moodLabels: Record<CharacterMood, string> = {
  neutral: "Neutral",
  positive: "Positive",
  concerned: "Concerned",
};

export function ArtReview({ pack }: { pack: ArtPack }) {
  const sceneIds = Object.keys(pack.scenes);
  const characterIds = Object.keys(pack.characters);
  const firstCharacter = pack.characters[characterIds[0]];

  return (
    <main className="art-review">
      <header className="art-review-header">
        <div>
          <p>ART PACK / {pack.id.toUpperCase()}</p>
          <h1>{pack.title.ja}</h1>
          <span>{pack.title.en}</span>
        </div>
        <Link href="/">表紙へ戻る</Link>
      </header>

      <section className="art-review-section">
        <div className="section-heading">
          <span>01</span>
          <div>
            <h2>Cover</h2>
            <p>Story-specific art inside the constant entry frame.</p>
          </div>
        </div>
        <img className="review-cover" src={pack.cover} alt="" />
      </section>

      {sceneIds.map((sceneId, index) => {
        const scene = pack.scenes[sceneId];
        return (
          <section className="art-review-section" key={sceneId}>
            <div className="section-heading">
              <span>{String(index + 2).padStart(2, "0")}</span>
              <div>
                <h2>Scene · {sceneId}</h2>
                <p>
                  Separate compositions avoid destructive universal cropping.
                  {scene.scale && scene.scale !== 1
                    ? ` Camera push-in ${scene.scale}×.`
                    : ""}
                </p>
              </div>
            </div>
            <div className="review-scenes">
              <figure>
                <img src={scene.landscape} alt="" />
                <figcaption>Landscape · {scene.focus.landscape}</figcaption>
              </figure>
              <figure className="portrait">
                <img src={scene.portrait} alt="" />
                <figcaption>Portrait · {scene.focus.portrait}</figcaption>
              </figure>
            </div>
          </section>
        );
      })}

      {characterIds.map((characterId, index) => {
        const character = pack.characters[characterId];
        return (
          <section className="art-review-section" key={characterId}>
            <div className="section-heading">
              <span>
                {String(sceneIds.length + index + 2).padStart(2, "0")}
              </span>
              <div>
                <h2>
                  Character · {characterId} ({character.label})
                </h2>
                <p>One identity, three restrained interface states.</p>
              </div>
            </div>
            <div className="review-characters">
              {(Object.keys(moodLabels) as CharacterMood[]).map((mood) => (
                <figure key={mood}>
                  <div className="character-plate">
                    <img src={character.art[mood]} alt="" />
                  </div>
                  <figcaption>{moodLabels[mood]}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        );
      })}

      <section className="art-review-section">
        <div className="section-heading">
          <span>
            {String(sceneIds.length + characterIds.length + 2).padStart(2, "0")}
          </span>
          <div>
            <h2>Composition contract</h2>
            <p>The pack declares anchoring; the frame supplies every UI layer.</p>
          </div>
        </div>
        <div
          className={`review-composite anchor-${firstCharacter.anchor}`}
          style={
            {
              "--scene-focus": pack.scenes[sceneIds[0]].focus.landscape,
              "--review-character-height": `${firstCharacter.heightPercent.desktop}%`,
              "--character-bottom": `${firstCharacter.bottomPercent}%`,
            } as CSSProperties
          }
        >
          <img
            className="review-composite-scene"
            src={pack.scenes[sceneIds[0]].landscape}
            alt=""
          />
          <img
            className="review-composite-character"
            src={firstCharacter.art.neutral}
            alt=""
          />
          <div className="review-safe-zone">BALLOON SAFE ZONE</div>
        </div>
      </section>
    </main>
  );
}
