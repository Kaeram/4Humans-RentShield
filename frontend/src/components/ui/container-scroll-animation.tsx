"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import {
    useScroll,
    useTransform,
    motion,
    MotionValue,
    useSpring,
} from "framer-motion";

export const ContainerScroll = ({
    titleComponent,
    children,
}: {
    titleComponent: string | ReactNode;
    children: ReactNode;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // 🎯 Scroll only while section is in view
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // 🧈 Controlled spring (no endless inertia)
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 30,
        mass: 0.6,
    });

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // ✨ Refined transforms
    const rotate = useTransform(smoothProgress, [0, 1], [12, 0]);
    const scale = useTransform(
        smoothProgress,
        [0, 1],
        isMobile ? [0.92, 0.98] : [1.02, 1]
    );
    const headerTranslate = useTransform(smoothProgress, [0, 1], [0, -30]);
    const opacity = useTransform(smoothProgress, [0, 0.2, 1], [0.95, 1, 1]);

    return (
        <div
            ref={containerRef}
            className="h-[50rem] md:h-[60rem] flex items-center justify-center relative p-2 md:p-10"
        >
            <div
                className="py-1 md:py-10 w-full relative"
                style={{ perspective: "1000px" }}
            >
                <Header
                    translate={headerTranslate}
                    titleComponent={titleComponent}
                />

                <Card rotate={rotate} scale={scale} opacity={opacity}>
                    {children}
                </Card>
            </div>
        </div>
    );
};

export const Header = ({
    translate,
    titleComponent,
}: {
    translate: MotionValue<number>;
    titleComponent: ReactNode;
}) => {
    return (
        <motion.div
            style={{ translateY: translate }}
            className="max-w-5xl mx-auto text-center"
        >
            {titleComponent}
        </motion.div>
    );
};

export const Card = ({
    rotate,
    scale,
    opacity,
    children,
}: {
    rotate: MotionValue<number>;
    scale: MotionValue<number>;
    opacity: MotionValue<number>;
    children: ReactNode;
}) => {
    return (
        <motion.div
            style={{
                rotateX: rotate,
                scale,
                opacity,
                willChange: "transform",
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                boxShadow:
                    "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
            }}
            className="max-w-3xl mt-12 md:mt-24 mx-auto h-[22rem] md:h-[28rem] w-full border-4 border-[#6C6C6C] p-2 md:p-4 bg-[#222222] rounded-[30px] shadow-2xl"
        >
            <div className="h-full w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-zinc-900 md:p-4">
                {children}
            </div>
        </motion.div>
    );
};

export default ContainerScroll;
