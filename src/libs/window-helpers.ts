
export const scrollTop = () => {
    setTimeout(function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
    }, 0);
};