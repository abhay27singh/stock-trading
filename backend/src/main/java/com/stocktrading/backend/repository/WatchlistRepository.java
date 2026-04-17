package com.stocktrading.backend.repository;

import com.stocktrading.backend.entity.Watchlist;
import com.stocktrading.backend.entity.User;
import com.stocktrading.backend.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByUser(User user);
    Optional<Watchlist> findByUserAndStock(User user, Stock stock);
    void deleteByUserAndStock(User user, Stock stock);
}