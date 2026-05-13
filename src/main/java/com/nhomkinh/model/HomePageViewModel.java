package com.nhomkinh.model;

public record HomePageViewModel(
        String pageTitle,
        String brandTitle,
        String brandSubtitle,
        String hotlineDisplay,
        String hotlineTelHref,
        String email,
        String addressLine
) {
}
