import SwiftUI
import Foundation

struct PilatesView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 1.6
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawPilates(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawPilates(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.42
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- TIMING ---
        let fullCycle = t.truncatingRemainder(dividingBy: .pi * 2)
        let isRightLeg = fullCycle < .pi
        
        let legPhase: CGFloat
        if isRightLeg {
            legPhase = CGFloat(fullCycle) / .pi
        } else {
            legPhase = CGFloat(fullCycle - .pi) / .pi
        }
        let rawLift = sin(legPhase * .pi)
        let liftProgress = rawLift * rawLift * (3 - 2 * rawLift)
        
        // --- GROUND / MAT ---
        let groundY = center.y + scale * 0.35
        let matLeft = center.x - scale * 0.95
        let matRight = center.x + scale * 0.85
        
        // --- BODY POSITION ---
        let hipX = center.x + scale * 0.05
        let hipY = groundY - scale * 0.08
        let hipPos = CGPoint(x: hipX, y: hipY)
        
        let torsoCurl: CGFloat = 0.25 + liftProgress * 0.35
        let torsoLen: CGFloat = scale * 0.42
        let shoulderPos = CGPoint(
            x: hipPos.x - cos(torsoCurl) * torsoLen,
            y: hipPos.y - sin(torsoCurl) * torsoLen
        )
        
        // --- HEAD ---
        let headRad: CGFloat = scale * 0.14
        let headAngle = torsoCurl + 0.2 + liftProgress * 0.15
        let headPos = CGPoint(
            x: shoulderPos.x - cos(headAngle) * headRad * 1.2,
            y: shoulderPos.y - sin(headAngle) * headRad * 1.2
        )

        // Align with torso, but compensate sprite base orientation to avoid over-rotation.
        let torsoAxisAngle = atan2(shoulderPos.y - hipPos.y, shoulderPos.x - hipPos.x)
        let goatHeadRotationCompensation: CGFloat = 1.9
        let goatHeadRotation = torsoAxisAngle + goatHeadRotationCompensation + liftProgress * 0.04
        
        // --- LEGS ---
        let thighLen: CGFloat = scale * 0.28
        let shinLen: CGFloat = scale * 0.28
        let restAngle: CGFloat = 0.18
        let liftedAngle: CGFloat = 1.35
        let depthOffset: CGFloat = 4.0
        
        let rightLiftAmount: CGFloat = isRightLeg ? liftProgress : 0
        let rightLegAngle = restAngle + (liftedAngle - restAngle) * rightLiftAmount
        let rightKneeBend: CGFloat = 0.5 * (1 - rightLiftAmount * 0.7)
        
        let rightKnee = CGPoint(
            x: hipPos.x + cos(rightLegAngle + rightKneeBend * 0.6) * thighLen,
            y: hipPos.y - sin(rightLegAngle + rightKneeBend * 0.6) * thighLen
        )
        let rightShineAngle = rightLegAngle - rightKneeBend * 0.8
        let rightFoot = CGPoint(
            x: rightKnee.x + cos(rightShineAngle) * shinLen,
            y: rightKnee.y - sin(rightShineAngle) * shinLen
        )
        
        let leftLiftAmount: CGFloat = isRightLeg ? 0 : liftProgress
        let leftLegAngle = restAngle + (liftedAngle - restAngle) * leftLiftAmount
        let leftKneeBend: CGFloat = 0.5 * (1 - leftLiftAmount * 0.7)
        
        let leftKnee = CGPoint(
            x: hipPos.x + cos(leftLegAngle + leftKneeBend * 0.6) * thighLen,
            y: hipPos.y - sin(leftLegAngle + leftKneeBend * 0.6) * thighLen
        )
        let leftShineAngle = leftLegAngle - leftKneeBend * 0.8
        let leftFoot = CGPoint(
            x: leftKnee.x + cos(leftShineAngle) * shinLen,
            y: leftKnee.y - sin(leftShineAngle) * shinLen
        )
        
        // --- ARMS ---
        let armLen: CGFloat = scale * 0.36
        let activeKnee = isRightLeg ? rightKnee : leftKnee
        let activeFoot = isRightLeg ? rightFoot : leftFoot
        
        let reachTarget = CGPoint(
            x: activeKnee.x * 0.4 + activeFoot.x * 0.6,
            y: activeKnee.y * 0.4 + activeFoot.y * 0.6
        )
        
        let reachElbowX: CGFloat = shoulderPos.x + (reachTarget.x - shoulderPos.x) * 0.5 * liftProgress + (1 - liftProgress) * scale * 0.15
        let reachElbowY: CGFloat = shoulderPos.y + (reachTarget.y - shoulderPos.y) * 0.5 * liftProgress + (1 - liftProgress) * scale * 0.06
        let reachElbow = CGPoint(x: reachElbowX, y: reachElbowY)
        
        let reachHandX: CGFloat = shoulderPos.x + (reachTarget.x - shoulderPos.x) * 0.85 * liftProgress + (1 - liftProgress) * scale * 0.25
        let reachHandY: CGFloat = shoulderPos.y + (reachTarget.y - shoulderPos.y) * 0.85 * liftProgress + (1 - liftProgress) * scale * 0.1
        let reachHand = CGPoint(x: reachHandX, y: reachHandY)
        
        // --- DRAWING ---
        
        // Mat
        var matPath = Path()
        matPath.move(to: CGPoint(x: matLeft, y: groundY + 3))
        matPath.addLine(to: CGPoint(x: matRight, y: groundY + 3))
        context.stroke(matPath, with: .color(stickColor.opacity(0.1)), style: StrokeStyle(lineWidth: 8, lineCap: .round))
        
        // Back arm
        var backArmPath = Path()
        backArmPath.move(to: shoulderPos)
        backArmPath.addLine(to: CGPoint(x: reachElbow.x, y: reachElbow.y + depthOffset))
        backArmPath.addLine(to: CGPoint(x: reachHand.x, y: reachHand.y + depthOffset))
        context.stroke(backArmPath, with: .color(stickColor.opacity(0.3)), style: StrokeStyle(lineWidth: 9, lineCap: .round, lineJoin: .round))
        
        // Back leg
        var backLegPath = Path()
        backLegPath.move(to: hipPos)
        backLegPath.addLine(to: CGPoint(x: leftKnee.x, y: leftKnee.y + depthOffset))
        backLegPath.addLine(to: CGPoint(x: leftFoot.x, y: leftFoot.y + depthOffset))
        context.stroke(backLegPath, with: .color(stickColor.opacity(0.3)), style: StrokeStyle(lineWidth: 11, lineCap: .round, lineJoin: .round))
        
        // Torso
        var torsoPath = Path()
        torsoPath.move(to: shoulderPos)
        torsoPath.addLine(to: hipPos)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Head (Goat Mode Support - Pilates uses cara6.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara6_negro" : "cara6"))
            let imgSize = headRad * 4.76
            var headContext = context
            headContext.translateBy(x: headPos.x, y: headPos.y)
            headContext.rotate(by: .radians(Double(goatHeadRotation)))
            let rect = CGRect(
                x: -imgSize / 2,
                y: -imgSize / 2 - (headRad * 0.14),
                width: imgSize,
                height: imgSize
            )
            headContext.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2, height: headRad * 2)), with: .color(stickColor))
        }
        
        // Front leg
        var frontLegPath = Path()
        frontLegPath.move(to: hipPos)
        frontLegPath.addLine(to: rightKnee)
        frontLegPath.addLine(to: rightFoot)
        context.stroke(frontLegPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // Front arm
        var frontArmPath = Path()
        frontArmPath.move(to: shoulderPos)
        frontArmPath.addLine(to: reachElbow)
        frontArmPath.addLine(to: reachHand)
        context.stroke(frontArmPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // Shadow
        let sW = scale * 1.6
        let shadowRect = CGRect(x: center.x - sW / 2, y: groundY + 8, width: sW, height: 5)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.1)))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        PilatesView()
            .frame(width: 300, height: 300)
    }
}
