---
name: pose-character-animator
description: Generate a consistent character first and then produce pose-by-pose image prompts for animation workflows. Use when the user asks to create a character, keep visual identity across frames, build pose sheets, convert a story beat into pose prompts, or prepare assets for 2D/AI-assisted animation.
---

# Pose Character Animator

Build one reusable character specification, then expand it into a clean pose sequence that can be rendered frame-by-frame in image models.

## Workflow

1. Lock character identity.
2. Plan animation beats.
3. Convert beats into explicit pose prompts.
4. Generate frames with consistency guards.
5. Package outputs for animation tools.

## 1) Lock character identity

Create a **Character Card** before generating poses.

Include:
- Name and role
- Age range and body type
- Face traits (eyes, nose, jaw, hairstyle)
- Outfit and color palette (hex or exact color words)
- Signature props/accessories
- Style tags (e.g., anime cel-shaded, semi-realistic 3D render)

Keep this card unchanged across all prompts.

## 2) Plan animation beats

Ask for:
- Action (what happens)
- Duration (seconds)
- FPS target (12/24/30)
- Camera mode (static, pan, zoom)

Convert to a short beat list. Example:
- Beat 1: idle anticipation
- Beat 2: crouch
- Beat 3: jump takeoff
- Beat 4: airborne arc
- Beat 5: landing recovery

## 3) Convert beats into pose prompts

For each beat, output:
- `frame_id`
- `pose_goal`
- `prompt`
- `negative_prompt`
- `consistency_tokens` (same across all frames)

Use template from `references/prompt-templates.md`.

## 4) Generate frames with consistency guards

Enforce:
- Same character card tokens in every prompt
- Same seed strategy for nearby frames (reuse or incremental seed)
- Controlled camera/background changes only when requested
- Fixed style keywords

If drift appears, reduce prompt entropy:
- Remove non-essential adjectives
- Reassert facial and outfit anchors
- Regenerate only failed frames, not the full sequence

## 5) Package for animation

Deliver:
- Numbered frames (`shot01_f001`, `shot01_f002`, ...)
- Optional interpolation notes (which frames are key poses)
- Suggested import settings for animation/compositing software

## Output format

When user asks for generation help, return in this order:
1. Character Card
2. Beat List
3. Pose Prompt Table
4. Render Checklist

Keep responses concise and production-ready.
