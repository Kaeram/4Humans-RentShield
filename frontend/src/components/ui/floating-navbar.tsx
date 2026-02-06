import { useState } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const FloatingNav = ({
    navItems,
    className,
}: {
    navItems: {
        name: string;
        link: string;
        icon?: JSX.Element;
    }[];
    className?: string;
}) => {
    const { scrollY } = useScroll();

    const [visible, setVisible] = useState(false);

    useMotionValueEvent(scrollY, "change", (current) => {
        // Check if current is not undefined and is a number
        if (typeof current === "number") {
            if (current > 50) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        }
    });

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{
                    opacity: 1,
                    y: -100,
                }}
                animate={{
                    y: visible ? 0 : -100,
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    duration: 0.2,
                }}
                className={cn(
                    "flex max-w-fit fixed top-8 left-8 border border-neutral-800 rounded-full bg-neutral-900/80 backdrop-blur-md shadow-2xl z-[5000] px-8 py-3 items-center justify-center space-x-4",
                    className
                )}
            >
                {navItems.map((navItem: any, idx: number) => (
                    <Link
                        key={`link=${idx}`}
                        to={navItem.link}
                        className={cn(
                            "relative items-center flex space-x-1 text-neutral-400 hover:text-neutral-100 transition-colors"
                        )}
                    >
                        <span className="block sm:hidden">{navItem.icon}</span>
                        <span className="hidden sm:block text-sm">{navItem.name}</span>
                    </Link>
                ))}
                <Link to="/login" className="border text-sm font-medium relative border-neutral-700 text-neutral-100 px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors">
                    <span>Login</span>
                    <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-lime-500 to-transparent h-px" />
                </Link>
            </motion.div>
        </AnimatePresence>
    );
};
