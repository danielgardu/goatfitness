//
//  YogaView.swift
//  figures
//

import SwiftUI
import Foundation

struct YogaView: View {
    @Environment(\.animationColorMode) private var colorMode
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                self.draw(in: &context, size: size, time: timeline.date.timeIntervalSinceReferenceDate)
            }
        }
    }
    
    private func draw(in context: inout GraphicsContext, size: CGSize, time: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.4
        
        // --- TIMING ---
        let breathCycle: CGFloat = 4.0
        let phase = CGFloat(time) * (.pi * 2) / breathCycle
        
        // Sway like an airplane flying gracefully
        let sway = sin(phase) * 0.08
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let lineWidth: CGFloat = 12
        
        // --- LOCAL SKELETON DEFINITION ---
        let hipLocal = CGPoint.zero
        
        // 1. Torso points Right and Up (forward lean)
        let torsoAngle: CGFloat = -.pi / 3.8  // ~ -47 degrees (leaning forward)
        let torsoLen: CGFloat = scale * 0.45
        let shoulderLocal = CGPoint(
            x: hipLocal.x + cos(torsoAngle) * torsoLen,
            y: hipLocal.y + sin(torsoAngle) * torsoLen
        )
        
        // 2. Head continues slightly more upright than Torso
        let headRad: CGFloat = scale * 0.16
        let headAngle: CGFloat = torsoAngle - 0.2
        let headLocal = CGPoint(
            x: shoulderLocal.x + cos(headAngle) * headRad * 1.5,
            y: shoulderLocal.y + sin(headAngle) * headRad * 1.5
        )
        
        // 3. Standing Leg points almost straight Down
        let standingLegAngle: CGFloat = .pi / 2.05 // ~ 88 degrees
        let standingThighLen: CGFloat = scale * 0.28
        let standingShinLen: CGFloat = scale * 0.28
        
        let standingKneeLocal = CGPoint(
            x: hipLocal.x + cos(standingLegAngle) * standingThighLen,
            y: hipLocal.y + sin(standingLegAngle) * standingThighLen
        )
        let standingFootLocal = CGPoint(
            x: standingKneeLocal.x + cos(standingLegAngle) * standingShinLen,
            y: standingKneeLocal.y + sin(standingLegAngle) * standingShinLen
        )
        
        // 4. Lifted Leg Thigh points strictly Left (Horizontal back)
        let liftedThighAngle: CGFloat = .pi // 180 degrees
        let liftedThighLen: CGFloat = scale * 0.36
        let liftedKneeLocal = CGPoint(
            x: hipLocal.x + cos(liftedThighAngle) * liftedThighLen,
            y: hipLocal.y + sin(liftedThighAngle) * liftedThighLen
        )
        
        // 5. Lifted Leg Shin points strictly Up 
        let liftedShinAngle: CGFloat = -.pi / 2.0 // -90 degrees
        let liftedShinLen: CGFloat = scale * 0.34
        let liftedFootLocal = CGPoint(
            x: liftedKneeLocal.x + cos(liftedShinAngle) * liftedShinLen,
            y: liftedKneeLocal.y + sin(liftedShinAngle) * liftedShinLen
        )
        
        // 6. Arms form a straight line (Airplane shape)
        let frontArmAngle: CGFloat = 0.28 // right and slightly down
        let armLen: CGFloat = scale * 0.42
        
        let frontElbowLocal = CGPoint(
            x: shoulderLocal.x + cos(frontArmAngle) * armLen * 0.5,
            y: shoulderLocal.y + sin(frontArmAngle) * armLen * 0.5
        )
        let frontHandLocal = CGPoint(
            x: shoulderLocal.x + cos(frontArmAngle) * armLen,
            y: shoulderLocal.y + sin(frontArmAngle) * armLen
        )
        
        // Back Arm extends exactly opposite to the front arm
        let backArmAngle = frontArmAngle + .pi
        let backElbowLocal = CGPoint(
            x: shoulderLocal.x + cos(backArmAngle) * armLen * 0.5,
            y: shoulderLocal.y + sin(backArmAngle) * armLen * 0.5
        )
        let backHandLocal = CGPoint(
            x: shoulderLocal.x + cos(backArmAngle) * armLen,
            y: shoulderLocal.y + sin(backArmAngle) * armLen
        )
        
        // --- TRANSFORM TO GLOBAL (Apply Sway & Anchor to Ground) ---
        func rotate(_ p: CGPoint, by angle: CGFloat) -> CGPoint {
            return CGPoint(
                x: p.x * cos(angle) - p.y * sin(angle),
                y: p.x * sin(angle) + p.y * cos(angle)
            )
        }
        
        let groundY = center.y + scale * 0.85
        let targetGround = CGPoint(x: center.x, y: groundY)
        let standingFootRotated = rotate(standingFootLocal, by: sway)
        let offsetX = targetGround.x - standingFootRotated.x
        let offsetY = targetGround.y - standingFootRotated.y
        
        func toGlobal(_ p: CGPoint) -> CGPoint {
            let r = rotate(p, by: sway)
            return CGPoint(x: r.x + offsetX, y: r.y + offsetY)
        }
        
        let hipPos = toGlobal(hipLocal)
        let shoulderPos = toGlobal(shoulderLocal)
        let headPos = toGlobal(headLocal)
        let standingKnee = toGlobal(standingKneeLocal)
        let standingFoot = toGlobal(standingFootLocal)
        let liftedKnee = toGlobal(liftedKneeLocal)
        let liftedFoot = toGlobal(liftedFootLocal)
        let frontElbow = toGlobal(frontElbowLocal)
        let frontHand = toGlobal(frontHandLocal)
        let backElbow = toGlobal(backElbowLocal)
        let backHand = toGlobal(backHandLocal)
        
        // --- DRAWING ---
        
        // Back leg (lifted)
        var liftedLegPath = Path()
        liftedLegPath.move(to: hipPos)
        liftedLegPath.addLine(to: liftedKnee)
        liftedLegPath.addLine(to: liftedFoot)
        context.stroke(liftedLegPath, with: .color(stickColor.opacity(0.4)),
            style: StrokeStyle(lineWidth: lineWidth, lineCap: .round, lineJoin: .round))
            
        // Back arm
        var backArmPath = Path()
        backArmPath.move(to: shoulderPos)
        backArmPath.addLine(to: backElbow)
        backArmPath.addLine(to: backHand)
        context.stroke(backArmPath, with: .color(stickColor.opacity(0.4)),
            style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // Torso
        var torsoPath = Path()
        torsoPath.move(to: shoulderPos)
        torsoPath.addLine(to: hipPos)
        context.stroke(torsoPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Head (Goat Mode Support - Yoga uses cara1.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara1_negro" : "cara1"))
            let imgSize = headRad * 4.76
            let rect = CGRect(
                x: headPos.x - imgSize/2,
                y: headPos.y - imgSize/2 - (headRad * 0.14),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(
                Path(ellipseIn: CGRect(
                    x: headPos.x - headRad, y: headPos.y - headRad,
                    width: headRad * 2, height: headRad * 2
                )),
                with: .color(stickColor)
            )
        }
        
        // Standing leg
        var standingLegPath = Path()
        standingLegPath.move(to: hipPos)
        standingLegPath.addLine(to: standingKnee)
        standingLegPath.addLine(to: standingFoot)
        context.stroke(standingLegPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: lineWidth, lineCap: .round, lineJoin: .round))
        
        // Front arm
        var frontArmPath = Path()
        frontArmPath.move(to: shoulderPos)
        frontArmPath.addLine(to: frontElbow)
        frontArmPath.addLine(to: frontHand)
        context.stroke(frontArmPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // --- SHADOW ---
        let sW = scale * 0.7
        let shadowRect = CGRect(x: center.x - sW / 2 + sway * scale * 0.8, y: groundY + 5, width: sW, height: 7)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.15)))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        YogaView()
            .frame(width: 300, height: 300)
    }
}
