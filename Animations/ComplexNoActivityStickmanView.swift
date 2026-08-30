import SwiftUI

struct ComplexNoActivityStickmanView: View {
    @Environment(\.animationColorMode) private var colorMode
    var isGoatMode: Bool = false
    
    var body: some View {
        GeometryReader { geo in
            let nativeSize: CGFloat = 300
            let scaleX = geo.size.width / nativeSize
            let scaleY = geo.size.height / nativeSize
            let scale = min(scaleX, scaleY)
            
            ComplexStickmanCanvas(isGoatMode: isGoatMode, colorMode: colorMode)
                .frame(width: nativeSize, height: nativeSize)
                .scaleEffect(scale, anchor: .center)
                .frame(width: geo.size.width, height: geo.size.height)
        }
    }
}

private struct ComplexStickmanCanvas: View {
    var isGoatMode: Bool
    var colorMode: AnimationColorMode
    
    @State private var startDate: Date? = nil
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let now = timeline.date
                let time: Double
                if let start = startDate {
                    time = now.timeIntervalSince(start)
                } else {
                    time = 0
                    DispatchQueue.main.async {
                        if startDate == nil {
                            startDate = now
                        }
                    }
                }
                
                self.drawSequence(in: &context, size: size, time: time)
            }
        }
        .onAppear {
            startDate = Date()
        }
    }
    
    private func lerp(a: CGFloat, b: CGFloat, t: Double) -> CGFloat {
        return a + (b - a) * CGFloat(max(0, min(1, t)))
    }
    
    private func lerp(a: CGPoint, b: CGPoint, t: Double) -> CGPoint {
        return CGPoint(x: lerp(a: a.x, b: b.x, t: t), y: lerp(a: a.y, b: b.y, t: t))
    }
    
    private func easeInOutSine(_ t: Double) -> Double {
        let t = max(0, min(1, t))
        return -(cos(.pi * t) - 1) / 2
    }
    
    private func drawSequence(in context: inout GraphicsContext, size: CGSize, time: Double) {
        let scale = min(size.width, size.height) * 0.42
        let groundY = size.height * 0.82
        let center = CGPoint(x: size.width / 2, y: groundY)
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // Base variables
        let torsoLen = scale * 0.42
        let legLen = scale * 0.58
        let armLen = scale * 0.50
        let hRadius = scale * 0.19
        
        var headPos = CGPoint.zero
        var shoulderPos = CGPoint.zero
        var hipPos = CGPoint.zero
        
        var lFoot = CGPoint.zero
        var rFoot = CGPoint.zero
        var lKnee = CGPoint.zero
        var rKnee = CGPoint.zero
        
        var lHand = CGPoint.zero
        var rHand = CGPoint.zero
        var lElbow = CGPoint.zero
        var rElbow = CGPoint.zero
        
        var isSideways = false
        var barAlpha: Double = 0.0
        
        // IK Helper
        func getJoint(start: CGPoint, end: CGPoint, len1: CGFloat, len2: CGFloat, invert: Bool) -> CGPoint {
            let dx = end.x - start.x
            let dy = end.y - start.y
            let dist = sqrt(dx*dx + dy*dy)
            
            if dist >= len1 + len2 {
                let ratio = len1 / (len1 + len2)
                return CGPoint(x: start.x + dx * ratio, y: start.y + dy * ratio)
            }
            
            let cosAngle = ((len1*len1) + (dist*dist) - (len2*len2)) / (2 * len1 * dist)
            let angle = acos(max(-1.0, min(1.0, cosAngle)))
            let baseAngle = atan2(dy, dx)
            let finalAngle = invert ? baseAngle - angle : baseAngle + angle
            
            return CGPoint(x: start.x + cos(finalAngle) * len1, y: start.y + sin(finalAngle) * len1)
        }
        
        // TIMELINE: ~16.5 seconds total
        // 0.0 - 1.0s: Pointing Transition
        // 1.0 - 3.5s: Pointing (flexing)
        // 3.5 - 4.5s: Drop to Push-up
        // 4.5 - 7.5s: Push-ups (2x 1.5s)
        // 7.5 - 8.5s: Stand Up
        // 8.5 - 9.0s: Idle, Bar fades in
        // 9.0 - 11.5s: Pull-up
        // 11.5 - 12.0s: Drop & Turn
        // 12.0 - 15.0s: Running
        // 15.0 - 16.0s: Stop Running (Decelerate to Side-Standing)
        // 16.0 - 16.5s: Turn Forward
        // 16.5s+: Idle breathing
        
        // Base standing
        let standHip = CGPoint(x: center.x, y: groundY - legLen * 0.98)
        let standShoulder = CGPoint(x: standHip.x, y: standHip.y - torsoLen)
        let standHead = CGPoint(x: standShoulder.x, y: standShoulder.y - hRadius * 1.3)
        let standLFoot = CGPoint(x: center.x - 12, y: groundY)
        let standRFoot = CGPoint(x: center.x + 12, y: groundY)
        let standLKnee = CGPoint(x: center.x - 5, y: (standLFoot.y + standHip.y) / 2 + 2)
        let standRKnee = CGPoint(x: center.x + 5, y: (standRFoot.y + standHip.y) / 2 + 2)
        let standLHand = CGPoint(x: standShoulder.x - 20, y: standShoulder.y + armLen * 0.9)
        let standRHand = CGPoint(x: standShoulder.x + 20, y: standShoulder.y + armLen * 0.9)
        let standLElbow = CGPoint(x: standShoulder.x - 12, y: standShoulder.y + armLen * 0.45)
        let standRElbow = CGPoint(x: standShoulder.x + 12, y: standShoulder.y + armLen * 0.45)
        
        // Pointing posture (Manual joints for bent, natural look)
        let pointHandBase = CGPoint(x: standShoulder.x + 15, y: standShoulder.y + armLen * 0.5)
        let pointElbowBase = CGPoint(x: standShoulder.x + 25, y: standShoulder.y + armLen * 0.25)
        let pointHandExt = CGPoint(x: standShoulder.x + 15, y: standShoulder.y + armLen * 0.8)
        let pointElbowExt = CGPoint(x: standShoulder.x + 20, y: standShoulder.y + armLen * 0.4)
        
        // Push-up posture
        let puLFoot = CGPoint(x: center.x - scale * 0.4, y: groundY)
        let puRFoot = CGPoint(x: center.x - scale * 0.35, y: groundY)
        let puHipDown = CGPoint(x: center.x + scale * 0.1, y: groundY - scale * 0.15)
        let puShoulderDown = CGPoint(x: center.x + scale * 0.5, y: groundY - scale * 0.25)
        let puHeadDown = CGPoint(x: puShoulderDown.x + hRadius * 1.0, y: puShoulderDown.y - hRadius * 0.5)
        let puLHand = CGPoint(x: center.x + scale * 0.55, y: groundY)
        let puRHand = CGPoint(x: center.x + scale * 0.45, y: groundY)
        
        let puHipUp = CGPoint(x: center.x, y: groundY - scale * 0.35)
        let puShoulderUp = CGPoint(x: center.x + scale * 0.35, y: groundY - scale * 0.5)
        let puHeadUp = CGPoint(x: puShoulderUp.x + hRadius * 1.0, y: puShoulderUp.y - hRadius * 0.5)
        
        // Pull-up posture (RAISED BAR so feet don't hit the floor awkwardly)
        let barY = center.y - scale * 1.8 
        let pullGrip = scale * 0.55
        let pullLHand = CGPoint(x: center.x - pullGrip/2, y: barY)
        let pullRHand = CGPoint(x: center.x + pullGrip/2, y: barY)
        let hangNeckY = barY + scale * 0.65
        let pullNeckY = barY + scale * 0.05
        
        // Side-View Standing Posture (for transitions)
        let sideShoulder = CGPoint(x: standHip.x, y: standHip.y - torsoLen)
        let sideLFoot = CGPoint(x: standHip.x, y: groundY)
        let sideRFoot = CGPoint(x: standHip.x, y: groundY)
        let sideLHand = CGPoint(x: sideShoulder.x, y: sideShoulder.y + armLen * 0.95)
        let sideRHand = CGPoint(x: sideShoulder.x, y: sideShoulder.y + armLen * 0.95)
        let sideLElbow = getJoint(start: sideShoulder, end: sideLHand, len1: armLen/2, len2: armLen/2, invert: false)
        let sideRElbow = getJoint(start: sideShoulder, end: sideRHand, len1: armLen/2, len2: armLen/2, invert: false)
        let sideLKnee = getJoint(start: standHip, end: sideLFoot, len1: legLen/2, len2: legLen/2, invert: false)
        let sideRKnee = getJoint(start: standHip, end: sideRFoot, len1: legLen/2, len2: legLen/2, invert: false)

        
        // Run Limb Generator
        func runLimb(start: CGPoint, phase: Double, cycle: Double) -> (CGPoint, CGPoint) {
            let p = cycle + phase
            let upperAngle = sin(CGFloat(p)) * 0.8
            let kneeFold = max(cos(CGFloat(p)) * 1.8, 0.1)
            let lowerAngle = upperAngle - kneeFold
            let kn = CGPoint(x: start.x + sin(upperAngle) * legLen * 0.5, y: start.y + cos(upperAngle) * legLen * 0.5)
            let ft = CGPoint(x: kn.x + sin(lowerAngle) * legLen * 0.5, y: kn.y + cos(lowerAngle) * legLen * 0.5)
            return (kn, ft)
        }
        
        func runArm(start: CGPoint, phase: Double, cycle: Double) -> (CGPoint, CGPoint) {
            let p = cycle + phase
            let upperAngle = sin(CGFloat(p)) * 0.8
            let elbAngle = upperAngle + 1.4
            let el = CGPoint(x: start.x + sin(upperAngle) * armLen * 0.55, y: start.y + cos(upperAngle) * armLen * 0.55)
            let hd = CGPoint(x: el.x + sin(elbAngle) * armLen * 0.45, y: el.y + cos(elbAngle) * armLen * 0.45)
            return (el, hd)
        }
        
        if time < 1.0 {
            // Transition to Pointing
            let progress = easeInOutSine(time / 1.0)
            
            headPos = standHead; shoulderPos = standShoulder; hipPos = standHip
            lFoot = standLFoot; rFoot = standRFoot
            lKnee = standLKnee; rKnee = standRKnee
            lHand = standLHand; lElbow = standLElbow
            
            rHand = lerp(a: standRHand, b: pointHandBase, t: progress)
            rElbow = lerp(a: standRElbow, b: pointElbowBase, t: progress)
            
        } else if time < 3.5 {
            // Pointing (flexing)
            let localTime = time - 1.0
            let cycle = (sin(localTime * .pi * 2 * 0.8) + 1) / 2.0
            
            headPos = standHead; shoulderPos = standShoulder; hipPos = standHip
            lFoot = standLFoot; rFoot = standRFoot
            lKnee = standLKnee; rKnee = standRKnee
            lHand = standLHand; lElbow = standLElbow
            
            rHand = lerp(a: pointHandBase, b: pointHandExt, t: cycle)
            rElbow = lerp(a: pointElbowBase, b: pointElbowExt, t: cycle)
            
        } else if time < 4.5 {
            // Drop to Push-up
            let progress = easeInOutSine((time - 3.5) / 1.0)
            
            headPos = lerp(a: standHead, b: puHeadUp, t: progress)
            shoulderPos = lerp(a: standShoulder, b: puShoulderUp, t: progress)
            hipPos = lerp(a: standHip, b: puHipUp, t: progress)
            lFoot = lerp(a: standLFoot, b: puLFoot, t: progress)
            rFoot = lerp(a: standRFoot, b: puRFoot, t: progress)
            lHand = lerp(a: standLHand, b: puLHand, t: progress)
            rHand = lerp(a: pointHandBase, b: puRHand, t: progress)
            
            lKnee = getJoint(start: hipPos, end: lFoot, len1: legLen/2, len2: legLen/2, invert: true)
            rKnee = getJoint(start: hipPos, end: rFoot, len1: legLen/2, len2: legLen/2, invert: true)
            lElbow = getJoint(start: shoulderPos, end: lHand, len1: armLen/2, len2: armLen/2, invert: true)
            rElbow = getJoint(start: shoulderPos, end: rHand, len1: armLen/2, len2: armLen/2, invert: false)
            
        } else if time < 7.5 {
            // Push-ups
            let localTime = time - 4.5
            let cycle = (1 - cos(localTime * .pi * 2 / 1.5)) / 2.0
            
            headPos = lerp(a: puHeadUp, b: puHeadDown, t: cycle)
            shoulderPos = lerp(a: puShoulderUp, b: puShoulderDown, t: cycle)
            hipPos = lerp(a: puHipUp, b: puHipDown, t: cycle)
            lFoot = puLFoot; rFoot = puRFoot
            lHand = puLHand; rHand = puRHand
            
            lKnee = getJoint(start: hipPos, end: lFoot, len1: legLen/2, len2: legLen/2, invert: true)
            rKnee = getJoint(start: hipPos, end: rFoot, len1: legLen/2, len2: legLen/2, invert: true)
            lElbow = getJoint(start: shoulderPos, end: lHand, len1: armLen/2, len2: armLen/2, invert: true)
            rElbow = getJoint(start: shoulderPos, end: rHand, len1: armLen/2, len2: armLen/2, invert: false)
            
        } else if time < 8.5 {
            // Stand Up
            let progress = easeInOutSine((time - 7.5) / 1.0)
            
            headPos = lerp(a: puHeadUp, b: standHead, t: progress)
            shoulderPos = lerp(a: puShoulderUp, b: standShoulder, t: progress)
            hipPos = lerp(a: puHipUp, b: standHip, t: progress)
            lFoot = lerp(a: puLFoot, b: standLFoot, t: progress)
            rFoot = lerp(a: puRFoot, b: standRFoot, t: progress)
            lHand = lerp(a: puLHand, b: standLHand, t: progress)
            rHand = lerp(a: puRHand, b: standRHand, t: progress)
            
            lKnee = getJoint(start: hipPos, end: lFoot, len1: legLen/2, len2: legLen/2, invert: true)
            rKnee = getJoint(start: hipPos, end: rFoot, len1: legLen/2, len2: legLen/2, invert: true)
            lElbow = getJoint(start: shoulderPos, end: lHand, len1: armLen/2, len2: armLen/2, invert: true)
            rElbow = getJoint(start: shoulderPos, end: rHand, len1: armLen/2, len2: armLen/2, invert: false)
            
        } else if time < 9.0 {
            // Idle, Bar fades in
            barAlpha = (time - 8.5) / 0.5
            headPos = standHead; shoulderPos = standShoulder; hipPos = standHip
            lFoot = standLFoot; rFoot = standRFoot
            lKnee = standLKnee; rKnee = standRKnee
            lHand = standLHand; rHand = standRHand
            lElbow = standLElbow; rElbow = standRElbow
            
        } else if time < 11.5 {
            // Pull-up
            barAlpha = 1.0
            let localTime = time - 9.0
            let jumpP = min(1.0, localTime / 0.6)
            let pullP: Double
            if localTime < 0.6 {
                pullP = 0
            } else if localTime < 1.5 {
                let tp = (localTime - 0.6) / 0.9
                pullP = sin(tp * .pi / 2)
            } else {
                let tp = (localTime - 1.5) / 1.0
                pullP = 1.0 - easeInOutSine(tp)
            }
            
            let currentNeckY = lerp(a: standShoulder.y, b: hangNeckY, t: easeInOutSine(jumpP))
            let finalNeckY = lerp(a: currentNeckY, b: pullNeckY, t: pullP)
            
            shoulderPos = CGPoint(x: center.x, y: finalNeckY)
            headPos = CGPoint(x: shoulderPos.x, y: shoulderPos.y - hRadius * 1.3)
            hipPos = CGPoint(x: center.x, y: shoulderPos.y + torsoLen)
            
            lHand = lerp(a: standLHand, b: pullLHand, t: easeInOutSine(jumpP))
            rHand = lerp(a: standRHand, b: pullRHand, t: easeInOutSine(jumpP))
            
            let legAngle = .pi / 2 - 0.02 - pullP * 0.05
            let legSpread = scale * 0.05 - pullP * 0.04
            
            lKnee = CGPoint(x: hipPos.x - legSpread - cos(legAngle) * legLen/2, y: hipPos.y + sin(legAngle) * legLen/2)
            rKnee = CGPoint(x: hipPos.x + legSpread + cos(legAngle) * legLen/2, y: hipPos.y + sin(legAngle) * legLen/2)
            lFoot = CGPoint(x: lKnee.x - cos(legAngle+0.05) * legLen/2, y: lKnee.y + sin(legAngle+0.05) * legLen/2)
            rFoot = CGPoint(x: rKnee.x + cos(legAngle+0.05) * legLen/2, y: rKnee.y + sin(legAngle+0.05) * legLen/2)
            
            lElbow = getJoint(start: shoulderPos, end: lHand, len1: armLen/2, len2: armLen/2, invert: true)
            rElbow = getJoint(start: shoulderPos, end: rHand, len1: armLen/2, len2: armLen/2, invert: false)
            
        } else if time < 12.0 {
            // Drop & Turn Sideways
            isSideways = true
            let localTime = time - 11.5
            barAlpha = max(0, 1.0 - localTime / 0.5)
            let progress = easeInOutSine(localTime / 0.5)
            
            let dropShoulder = CGPoint(x: center.x, y: hangNeckY)
            let dropHead = CGPoint(x: center.x, y: hangNeckY - hRadius * 1.3)
            let dropHip = CGPoint(x: center.x, y: hangNeckY + torsoLen)
            
            let runCycle0 = 0.0
            let runBounce0 = (1 - cos(CGFloat(runCycle0 * 2))) * 2.0
            let runHipY0 = standHip.y + runBounce0
            let runHip0 = CGPoint(x: center.x, y: runHipY0)
            let runLean = 0.15
            let runShoulder0 = CGPoint(x: center.x + sin(runLean) * torsoLen, y: runHipY0 - cos(runLean) * torsoLen)
            let runHead0 = CGPoint(x: runShoulder0.x + sin(runLean) * hRadius * 1.5, y: runShoulder0.y - cos(runLean) * hRadius * 1.5)
            
            headPos = lerp(a: dropHead, b: runHead0, t: progress)
            shoulderPos = lerp(a: dropShoulder, b: runShoulder0, t: progress)
            hipPos = lerp(a: dropHip, b: runHip0, t: progress)
            
            let bArm = runArm(start: shoulderPos, phase: .pi, cycle: 0)
            let fArm = runArm(start: shoulderPos, phase: 0, cycle: 0)
            let bLeg = runLimb(start: hipPos, phase: 0, cycle: 0)
            let fLeg = runLimb(start: hipPos, phase: .pi, cycle: 0)
            
            lHand = lerp(a: pullLHand, b: bArm.1, t: progress)
            rHand = lerp(a: pullRHand, b: fArm.1, t: progress)
            lElbow = lerp(a: getJoint(start: dropShoulder, end: pullLHand, len1: armLen/2, len2: armLen/2, invert: true), b: bArm.0, t: progress)
            rElbow = lerp(a: getJoint(start: dropShoulder, end: pullRHand, len1: armLen/2, len2: armLen/2, invert: false), b: fArm.0, t: progress)
            
            // Re-use pull-up leg coordinates for start of drop
            let legAngle = .pi / 2 - 0.02
            let legSpread = scale * 0.05
            let pullLKnee = CGPoint(x: dropHip.x - legSpread - cos(legAngle) * legLen/2, y: dropHip.y + sin(legAngle) * legLen/2)
            let pullRKnee = CGPoint(x: dropHip.x + legSpread + cos(legAngle) * legLen/2, y: dropHip.y + sin(legAngle) * legLen/2)
            let pullLFoot = CGPoint(x: pullLKnee.x - cos(legAngle+0.05) * legLen/2, y: pullLKnee.y + sin(legAngle+0.05) * legLen/2)
            let pullRFoot = CGPoint(x: pullRKnee.x + cos(legAngle+0.05) * legLen/2, y: pullRKnee.y + sin(legAngle+0.05) * legLen/2)

            lFoot = lerp(a: pullLFoot, b: bLeg.1, t: progress)
            rFoot = lerp(a: pullRFoot, b: fLeg.1, t: progress)
            lKnee = lerp(a: pullLKnee, b: bLeg.0, t: progress)
            rKnee = lerp(a: pullRKnee, b: fLeg.0, t: progress)
            
        } else if time < 15.0 {
            // Running Sideways
            isSideways = true
            let localTime = time - 12.0
            let runSpeed = 7.5
            let cycle = localTime * runSpeed
            
            let bounce = (1 - cos(CGFloat(cycle * 2))) * 2.0
            hipPos = CGPoint(x: center.x, y: standHip.y + bounce)
            
            let leanAngle: CGFloat = 0.15
            shoulderPos = CGPoint(x: hipPos.x + sin(leanAngle) * torsoLen, y: hipPos.y - cos(leanAngle) * torsoLen)
            headPos = CGPoint(x: shoulderPos.x + sin(leanAngle) * hRadius * 1.5, y: shoulderPos.y - cos(leanAngle) * hRadius * 1.5)
            
            let bArm = runArm(start: shoulderPos, phase: .pi, cycle: cycle)
            let fArm = runArm(start: shoulderPos, phase: 0, cycle: cycle)
            let bLeg = runLimb(start: hipPos, phase: 0, cycle: cycle)
            let fLeg = runLimb(start: hipPos, phase: .pi, cycle: cycle)
            
            lElbow = bArm.0; lHand = bArm.1
            lKnee = bLeg.0; lFoot = bLeg.1
            rElbow = fArm.0; rHand = fArm.1
            rKnee = fLeg.0; rFoot = fLeg.1
            
        } else if time < 16.0 {
            // Stop Running (Decelerate to Side-Standing)
            isSideways = true
            let localTime = time - 15.0
            let runSpeed = 7.5
            // Velocity smoothly goes to 0: integrate v0*(1-t) -> v0*(t - t^2/2)
            let baseCycle = 3.0 * runSpeed // cycle at time=15.0
            let cycle = baseCycle + runSpeed * (localTime - (localTime * localTime) / 2.0)
            
            let stopProgress = easeInOutSine(localTime)
            
            let bounce = (1 - cos(CGFloat(cycle * 2))) * 2.0
            let runningHipY = standHip.y + bounce
            hipPos = CGPoint(x: center.x, y: lerp(a: runningHipY, b: standHip.y, t: stopProgress))
            
            let leanAngle: CGFloat = 0.15 * (1.0 - stopProgress)
            shoulderPos = CGPoint(x: hipPos.x + sin(leanAngle) * torsoLen, y: hipPos.y - cos(leanAngle) * torsoLen)
            headPos = CGPoint(x: shoulderPos.x + sin(leanAngle) * hRadius * 1.5, y: shoulderPos.y - cos(leanAngle) * hRadius * 1.5)
            
            let bArm = runArm(start: shoulderPos, phase: .pi, cycle: cycle)
            let fArm = runArm(start: shoulderPos, phase: 0, cycle: cycle)
            let bLeg = runLimb(start: hipPos, phase: 0, cycle: cycle)
            let fLeg = runLimb(start: hipPos, phase: .pi, cycle: cycle)
            
            lElbow = lerp(a: bArm.0, b: sideLElbow, t: stopProgress)
            lHand = lerp(a: bArm.1, b: sideLHand, t: stopProgress)
            lKnee = lerp(a: bLeg.0, b: sideLKnee, t: stopProgress)
            lFoot = lerp(a: bLeg.1, b: sideLFoot, t: stopProgress)
            
            rElbow = lerp(a: fArm.0, b: sideRElbow, t: stopProgress)
            rHand = lerp(a: fArm.1, b: sideRHand, t: stopProgress)
            rKnee = lerp(a: fLeg.0, b: sideRKnee, t: stopProgress)
            rFoot = lerp(a: fLeg.1, b: sideRFoot, t: stopProgress)
            
        } else if time < 16.5 {
            // Turn Forward
            let progress = easeInOutSine((time - 16.0) / 0.5)
            // Switch head image exactly at 50% progress
            isSideways = progress < 0.5
            
            headPos = standHead; shoulderPos = standShoulder; hipPos = standHip
            
            lHand = lerp(a: sideLHand, b: standLHand, t: progress)
            rHand = lerp(a: sideRHand, b: standRHand, t: progress)
            lFoot = lerp(a: sideLFoot, b: standLFoot, t: progress)
            rFoot = lerp(a: sideRFoot, b: standRFoot, t: progress)
            lKnee = lerp(a: sideLKnee, b: standLKnee, t: progress)
            rKnee = lerp(a: sideRKnee, b: standRKnee, t: progress)
            lElbow = lerp(a: sideLElbow, b: standLElbow, t: progress)
            rElbow = lerp(a: sideRElbow, b: standRElbow, t: progress)
            
        } else {
            // 16.5s+: Idle breathing
            let localTime = time - 16.5
            
            let breathCycle = sin(localTime * .pi * 2 / 2.5)
            let breathFactor = (breathCycle + 1) / 2
            
            let idleTorsoLen = torsoLen * (0.97 + breathFactor * 0.03)
            let hipOffsetY = legLen * (0.98 + breathFactor * 0.02)
            
            hipPos = CGPoint(x: center.x, y: groundY - hipOffsetY)
            shoulderPos = CGPoint(x: hipPos.x, y: hipPos.y - idleTorsoLen)
            headPos = CGPoint(x: shoulderPos.x, y: shoulderPos.y - hRadius * 1.3)
            
            lFoot = standLFoot; rFoot = standRFoot
            lKnee = CGPoint(x: (lFoot.x + hipPos.x)/2 - 5, y: (lFoot.y + hipPos.y)/2 + 2)
            rKnee = CGPoint(x: (rFoot.x + hipPos.x)/2 + 5, y: (rFoot.y + hipPos.y)/2 + 2)
            
            lHand = standLHand; lElbow = standLElbow
            rHand = standRHand; rElbow = standRElbow
        }
        
        // ----- DRAWING -----
        
        // Shadow
        let sWidth = scale * 1.0
        let sRect = CGRect(x: center.x - sWidth / 2, y: groundY + 5, width: sWidth, height: 6)
        context.fill(Path(ellipseIn: sRect), with: .color(stickColor.opacity(0.07)))
        
        func drawLimbPath(_ p1: CGPoint, _ p2: CGPoint, _ p3: CGPoint, width: CGFloat, alpha: Double = 1.0) {
            var path = Path()
            path.move(to: p1)
            path.addLine(to: p2)
            path.addLine(to: p3)
            context.stroke(path, with: .color(stickColor.opacity(alpha)), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        }
        
        if isSideways {
            drawLimbPath(shoulderPos, lElbow, lHand, width: 10, alpha: 0.4)
            drawLimbPath(hipPos, lKnee, lFoot, width: 12, alpha: 0.4)
        } else {
            drawLimbPath(shoulderPos, lElbow, lHand, width: 10)
            drawLimbPath(hipPos, lKnee, lFoot, width: 12)
        }
        
        var torsoPath = Path()
        torsoPath.move(to: shoulderPos)
        torsoPath.addLine(to: hipPos)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        if isGoatMode {
            if isSideways {
                let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara6_negro" : "cara6"))
                let imgSize = hRadius * 4.76
                let rect = CGRect(x: headPos.x - imgSize/2, y: headPos.y - imgSize/2 - (hRadius * 0.14), width: imgSize, height: imgSize)
                context.draw(headImage, in: rect)
            } else {
                let headImage = context.resolve(Image(colorMode == .darkStickman ? "carafrenteespejo_negro" : "carafrenteespejo"))
                let imgSize = hRadius * 5.17
                let rect = CGRect(x: headPos.x - imgSize * 0.5, y: headPos.y - imgSize/2 - (hRadius * 0.26) - (imgSize * 0.05), width: imgSize, height: imgSize)
                context.draw(headImage, in: rect)
            }
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - hRadius, y: headPos.y - hRadius, width: hRadius * 2, height: hRadius * 2)), with: .color(stickColor))
        }
        
        drawLimbPath(shoulderPos, rElbow, rHand, width: 10)
        drawLimbPath(hipPos, rKnee, rFoot, width: 12)
        
        if barAlpha > 0 {
            let barWidth = scale * 1.6
            var barPath = Path()
            barPath.move(to: CGPoint(x: center.x - barWidth/2, y: barY))
            barPath.addLine(to: CGPoint(x: center.x + barWidth/2, y: barY))
            context.stroke(barPath, with: .color(.orange.opacity(barAlpha)), style: StrokeStyle(lineWidth: 12, lineCap: .round))
        }
    }
}
