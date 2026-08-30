import SwiftUI
import Foundation

struct AmericanFootballView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 0.42 // Faster global clock
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawScene(into: &context, size: size, time: t)
            }
        }
    }
    
    // MARK: - Easing & Math helpers
    
    private func phase(_ c: Double, _ start: Double, _ end: Double) -> Double {
        if c <= start { return 0.0 }
        if c >= end { return 1.0 }
        return (c - start) / (end - start)
    }
    
    private func smoothStep(_ v: Double) -> Double {
        let u = min(1.0, max(0.0, v))
        return u * u * (3.0 - 2.0 * u)
    }
    
    // Higher order easing for the throw
    private func cubicBezier(_ v: Double) -> Double {
        let u = min(1.0, max(0.0, v))
        return u * u * u
    }
    
    private func lerp(_ a: CGFloat, _ b: CGFloat, _ t: Double) -> CGFloat {
        a + (b - a) * CGFloat(t)
    }
    
    private func lerpPoint(_ a: CGPoint, _ b: CGPoint, _ t: Double) -> CGPoint {
        CGPoint(x: a.x + (b.x - a.x) * CGFloat(t), y: a.y + (b.y - a.y) * CGFloat(t))
    }
    
    private func solveIK(start: CGPoint, end: CGPoint, len1: CGFloat, len2: CGFloat, bendSign: CGFloat) -> CGPoint {
        let dx = end.x - start.x
        let dy = end.y - start.y
        let distRaw = sqrt(dx * dx + dy * dy)
        let dist = max(0.0001, min(distRaw, len1 + len2 - 0.001))
        let base = atan2(dy, dx)
        let cosA = (len1 * len1 + dist * dist - len2 * len2) / (2.0 * len1 * dist)
        let angleA = acos(max(-1.0, min(1.0, cosA)))
        let jointAngle = base + bendSign * angleA
        return CGPoint(x: start.x + cos(jointAngle) * len1, y: start.y + sin(jointAngle) * len1)
    }
    
    private func drawLimb(_ ctx: GraphicsContext, _ p1: CGPoint, _ p2: CGPoint, _ p3: CGPoint, color: Color, width: CGFloat) {
        var path = Path()
        path.move(to: p1)
        path.addLine(to: p2)
        path.addLine(to: p3)
        ctx.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
    }
    
    private func drawScene(into context: inout GraphicsContext, size: CGSize, time t: Double) {
        let c = t.truncatingRemainder(dividingBy: 1.0)
        
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.42
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let ballColor = Color(red: 0.65, green: 0.22, blue: 0.10)
        
        // --- Key Animation Timings ---
        // 0.0 - 0.2: Stance
        // 0.2 - 0.38: Load (cocking back)
        // 0.38 - 0.42: Throw (SNAP) - Hyper fast snap duration 0.04
        // 0.42 - 0.60: Follow through
        // 0.60 - 1.0: Recover
        
        func keyPose(_ stance: CGFloat, _ load: CGFloat, _ release: CGFloat, _ follow: CGFloat) -> CGFloat {
            if c < 0.20 { return stance }
            if c < 0.38 { return self.lerp(stance, load, self.smoothStep(self.phase(c, 0.20, 0.38))) }
            if c < 0.42 { return self.lerp(load, release, self.phase(c, 0.38, 0.42)) }
            if c < 0.60 { return self.lerp(release, follow, self.smoothStep(self.phase(c, 0.42, 0.60))) }
            return self.lerp(follow, stance, self.smoothStep(self.phase(c, 0.60, 1.0)))
        }
        
        let groundY = center.y + scale * 0.75
        let torsoLen = scale * 0.48
        let armLen = scale * 0.28
        let headRad = scale * 0.16
        
        // Hips (Weight shifts right to left during throw)
        let hipsBase = CGPoint(x: center.x + scale * 0.05, y: groundY - scale * 0.66)
        let weightShift = keyPose(0, scale * 0.05, -scale * 0.15, -scale * 0.20)
        let hips = CGPoint(x: hipsBase.x + weightShift, y: hipsBase.y + keyPose(0, scale * 0.01, -scale * 0.01, 0))
        
        // Torso & Shoulders
        let lean = keyPose(0.01, 0.10, -0.15, -0.28) // Subtle lean
        let shoulders = CGPoint(
            x: hips.x + sin(lean) * torsoLen,
            y: hips.y - cos(lean) * torsoLen
        )
        
        // Head
        let headPos = CGPoint(
            x: shoulders.x + headRad * 0.5 * sin(lean - 0.05),
            y: shoulders.y - headRad * 1.4
        )
        
        // Legs (Facing left profile)
        let leftFoot = CGPoint(x: center.x - scale * 0.10 + weightShift * 0.2, y: groundY)
        let rightFoot = CGPoint(x: center.x + scale * 0.40 + weightShift * 0.1, y: groundY)
        
        let lKnee = self.solveIK(start: hips, end: leftFoot, len1: scale * 0.35, len2: scale * 0.35, bendSign: 1)
        let rKnee = self.solveIK(start: hips, end: rightFoot, len1: scale * 0.35, len2: scale * 0.35, bendSign: 1)
        
        // --- Throwing Arm ---
        let cockedBack = CGPoint(x: shoulders.x + scale * 0.35, y: shoulders.y - scale * 0.25)
        let released = CGPoint(x: shoulders.x - scale * 0.38, y: shoulders.y - scale * 0.46)
        let followThrough = CGPoint(x: shoulders.x - scale * 0.10, y: shoulders.y + scale * 0.60)
        let recoveryBack = CGPoint(x: shoulders.x + scale * 0.35, y: shoulders.y + scale * 0.40)
        
        let throwHand: CGPoint = {
            if c < 0.20 { return cockedBack }
            if c < 0.38 { return self.lerpPoint(cockedBack, cockedBack.applying(.init(translationX: scale * 0.05, y: -scale * 0.02)), self.smoothStep(self.phase(c, 0.20, 0.38))) }
            if c < 0.42 { return self.lerpPoint(cockedBack, released, self.phase(c, 0.38, 0.42)) }
            if c < 0.70 { 
                let raw = self.lerpPoint(released, followThrough, self.smoothStep(self.phase(c, 0.42, 0.70)))
                let dx = raw.x - shoulders.x
                let dy = raw.y - shoulders.y
                let mag = sqrt(dx*dx + dy*dy)
                let tDist = scale * 0.60
                return CGPoint(x: shoulders.x + (dx/mag) * tDist, y: shoulders.y + (dy/mag) * tDist)
            }
            if c < 0.88 { return self.lerpPoint(followThrough, recoveryBack, self.smoothStep(self.phase(c, 0.70, 0.88))) }
            return self.lerpPoint(recoveryBack, cockedBack, self.smoothStep(self.phase(c, 0.88, 1.0)))
        }()
        
        let throwElbow = self.solveIK(start: shoulders, end: throwHand, len1: armLen, len2: armLen, bendSign: 0.5)
        
        // --- Guide Arm ---
        let guidePeak = CGPoint(x: shoulders.x - scale * 0.40, y: shoulders.y - scale * 0.30)
        let guideStance = CGPoint(x: shoulders.x - scale * 0.15, y: shoulders.y + scale * 0.40)
        let guideHand: CGPoint = {
            if c < 0.38 { return guidePeak }
            if c < 0.50 { return self.lerpPoint(guidePeak, guideStance, self.smoothStep(self.phase(c, 0.38, 0.50))) }
            if c < 0.75 { return guideStance }
            return self.lerpPoint(guideStance, guidePeak, self.smoothStep(self.phase(c, 0.75, 1.0)))
        }()
        let guideElbow = self.solveIK(start: shoulders, end: guideHand, len1: armLen * 0.8, len2: armLen * 0.8, bendSign: -1)
        
        // ------------------------------------------------
        // DRAW LAYERS
        // ------------------------------------------------
        
        // Back Limb
        self.drawLimb(context, hips, rKnee, rightFoot, color: stickColor.opacity(0.4), width: 12)
        
        // Torso
        var torsoPath = Path()
        torsoPath.move(to: shoulders)
        torsoPath.addLine(to: hips)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 15, lineCap: .round))
        
        // Head (Goat Mode Support - American Football uses cara11espejo.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara11espejo_negro" : "cara11espejo"))
            let imgSize = headRad * 4.76
            let rect = CGRect(
                x: headPos.x - imgSize/2,
                y: headPos.y - imgSize/2 - (headRad * 0.14),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2, height: headRad * 2)), with: .color(stickColor))
        }
        
        // Front limbs
        self.drawLimb(context, hips, lKnee, leftFoot, color: stickColor, width: 12)
        self.drawLimb(context, shoulders, guideElbow, guideHand, color: stickColor.opacity(0.5), width: 10)
        self.drawLimb(context, shoulders, throwElbow, throwHand, color: stickColor, width: 10)
        
        // --- FOOTBALL ---
        let bRadX = scale * 0.14
        let bRadY = scale * 0.08
        let releaseTime = 0.40 // Release at end of snap
        
        if c < releaseTime || c > 0.85 {
            // Ball in hand
            let opacity = (c > 0.85) ? self.smoothStep(self.phase(c, 0.85, 1.0)) : 1.0
            context.drawLayer { ctx in
                ctx.translateBy(x: throwHand.x, y: throwHand.y)
                ctx.rotate(by: .degrees(-15))
                self.drawBall(ctx, rect: CGRect(x: -bRadX, y: -bRadY, width: bRadX * 2, height: bRadY * 2), color: ballColor, op: opacity)
            }
        } else {
            // Ball in flight (launching left)
            let flightP = self.phase(c, releaseTime, 0.65) // Faster flight phase
            let startPos = released
            let targetPos = CGPoint(x: center.x - scale * 3.5, y: center.y - scale * 0.4) // Farther and faster
            
            let ballPos = self.lerpPoint(startPos, targetPos, self.cubicBezier(flightP))
            let arch = sin(CGFloat(flightP * .pi)) * scale * 0.12
            
            let flyOpacity = 1.0 - self.smoothStep(self.phase(c, 0.6, 0.65))
            
            context.drawLayer { ctx in
                ctx.translateBy(x: ballPos.x, y: ballPos.y - arch)
                ctx.rotate(by: .degrees(-15))
                self.drawBall(ctx, rect: CGRect(x: -bRadX, y: -bRadY, width: bRadX * 2, height: bRadY * 2), color: ballColor, op: flyOpacity)
            }
        }
        
        // Shadow
        let shadowW = scale * 1.2
        context.fill(Path(ellipseIn: CGRect(x: center.x - shadowW/2 + weightShift, y: groundY + 5, width: shadowW, height: 8)), with: .color(.black.opacity(0.2)))
    }
    
    private func drawBall(_ ctx: GraphicsContext, rect: CGRect, color: Color, op: Double) {
        ctx.fill(Path(ellipseIn: rect), with: .color(color.opacity(op)))
        // Laces
        var laces = Path()
        laces.move(to: CGPoint(x: rect.minX + rect.width * 0.2, y: rect.midY))
        laces.addLine(to: CGPoint(x: rect.maxX - rect.width * 0.2, y: rect.midY))
        ctx.stroke(laces, with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(op * 0.8)), style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
        for i in 0...4 {
            let x = rect.minX + rect.width * (0.3 + Double(i) * 0.1)
            var cross = Path()
            cross.move(to: CGPoint(x: x, y: rect.midY - 5))
            cross.addLine(to: CGPoint(x: x, y: rect.midY + 5))
            ctx.stroke(cross, with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(op * 0.8)), style: StrokeStyle(lineWidth: 2))
        }
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        AmericanFootballView()
            .frame(width: 320, height: 240)
    }
}
