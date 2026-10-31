import type { ReactNode } from "react";
/**
 * A social post as it will look on its channel (Facebook, Instagram,
 * LinkedIn, Threads, Pinterest): who posts it with their avatar, when, the image on top with
 * the text under it, and the channel's reactions. The reactions are
 * decoration, hidden from screen readers.
 *
 * `children` is the post's text, or an editor for it. Without `avatar` the
 * avatar is the name's first letter. `imagePlaceholder` fills the image's
 * place until there is one (Instagram and Pinterest need one). A Pin
 * shows its `title` in bold under a tall 2:3 image, and has no reactions bar.
 */
export declare function PostPreview({ platform, name, meta, avatar, icon, image, imageAlt, imagePlaceholder, title, className, children, }: {
    platform: string;
    name: string;
    /** Under the name, e.g. "Just now · Facebook". */
    meta?: ReactNode;
    avatar?: string | null;
    /** In place of the avatar: the channel's logo, about 40px. */
    icon?: ReactNode;
    image?: string | null;
    imageAlt?: string;
    imagePlaceholder?: ReactNode;
    /** A Pin's title, shown above the text (Pinterest only). */
    title?: ReactNode;
    className?: string;
    children?: ReactNode;
}): import("react").JSX.Element;
