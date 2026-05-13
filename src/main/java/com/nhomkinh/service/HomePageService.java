package com.nhomkinh.service;

import com.nhomkinh.model.HomePageViewModel;
import org.springframework.stereotype.Service;

@Service
public class HomePageService {

    public HomePageViewModel buildHomePage() {
        return new HomePageViewModel(
                "Nhôm Kính An Bình — Hải Phòng",
                "AN BÌNH",
                "Nhôm Kính Hải Phòng",
                "0984 936 989",
                "tel:0984936989",
                "nguyenquyen301172@gmail.com",
                "Đội 8, An Phú, TP. Hải Phòng"
        );
    }
}
