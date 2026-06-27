import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchQuizzes, selectQuizzes, selectStatus } from "./loader-slice";
import "./styles.css";

const Loader = () => {
    const quizzes = useAppSelector(selectQuizzes);
    const fetchStatus = useAppSelector(selectStatus);
    const dispatch = useAppDispatch();
    const isLoading = fetchStatus === "loading";

    useEffect(() => {
        if ((quizzes || []).length === 0 && fetchStatus === "idle") {
            dispatch(fetchQuizzes());
        }
    // ponytail: intentional mount-only effect — re-running on dep changes causes redundant fetches
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div aria-live="polite" aria-busy={isLoading}>
            {fetchStatus === "failed" && <p role="alert">Failed to load quizzes. Please refresh the page.</p>}
            {fetchStatus === "unauthorized" && <p role="alert">Sign in to view this content.</p>}
        </div>
    );
};

export default Loader;
