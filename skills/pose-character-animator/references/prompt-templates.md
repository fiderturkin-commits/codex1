# Prompt templates

## A) Character card template

```text
Character: <name>, <role>
Body: <height/build/posture>
Face: <eyes>, <nose>, <jaw>, <expression baseline>
Hair: <style>, <length>, <color>
Outfit: <top>, <bottom>, <shoes>, <materials>, <palette>
Accessories: <items>
Style: <style tags>
Lighting baseline: <soft studio / cinematic / daylight>
Background baseline: <simple / detailed>
```

## B) Pose frame template

```text
frame_id: <shot##_f###>
pose_goal: <clear body action>
prompt: "<character anchors>, full body, <pose details>, <camera>, <lighting>, <background>, high detail"
negative_prompt: "deformed hands, extra limbs, face distortion, wrong outfit colors, inconsistent hairstyle, motion blur artifacts"
consistency_tokens: "<same style tags + same character anchors + same palette terms>"
```

## C) Simple beat-to-pose mapping

- Anticipation: center of gravity lowers, shoulders tense
- Action peak: full extension or strongest silhouette
- Recovery: weight shift and balance correction

Use these mappings to keep motion readable.
