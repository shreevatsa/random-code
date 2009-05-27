#include <iostream>
#include <vector>
#include <sstream>
#include <string>
#include <set>
#include <map>
using namespace std;

#define FCO(i,a,b) for(int i=a,_b=b;i<_b;++i)
#define FOR(i,n) FCO(i,0,n)
#define SZ(s) signed(s.size())
#define FOZ(i,s) FOR(i,SZ(s))
#define LET(a,b) typeof(b) a=b
#define FOREACH(i,v) for(LET(i,v.begin());i!=v.end();++i)
#define PB push_back
typedef vector<int> VI;
typedef long long ll;

ostream& operator<<(ostream& o, VI v) {
  FOZ(i,v) { if(i) o<<"*"; o<<v[i]; }
  return o;
}

const int MAXN=100000000;
int fifac[MAXN];

VI factors(int n) {
  VI ret;
  while(n>1) {
    ret.PB(fifac[n]);
    n/=fifac[n];
  }
  return ret;
}

int phi(int n) {
  ll ret=1;
  while(n>1) {
    int p = fifac[n], pk=1;
    while(n>1 and fifac[n]==p) { n/=p; pk*=p; }
    ret *= pk-pk/p;
  }
  return ret;
}

bool good(int n) {
  return (n-1) % (n-phi(n)) == 0;
}

int main() {
  FOR(i,MAXN) fifac[i]=i;
  FCO(i,2,MAXN) {
    if(fifac[i]<i) continue;
    for(ll j=ll(i)*i; j<MAXN; j+=i) {
      if(fifac[j]==j) fifac[j]=i;
    }
  }

  map<int, VI > fork;
  set<int> goodn;
  FCO(n,2,MAXN) {
    if(fifac[n]!=n and good(n))
      {
        goodn.insert(n);
        int k = (n-1)/(n-phi(n));
        fork[k].PB(n);
        cout<<n<<": "<<k<<" "<<factors(n);
        int m = n/fifac[n];
        if(not(fifac[m]==m or goodn.count(m))) cout<<"\t\t<--WHOA";
        cout<<endl;
      }
  }
  FOREACH(it,fork) {
    int k = it->first;
    cout<<"For "<<k<<": "<<endl;
    VI v = it->second;
    FOZ(i,v) {
      int n = v[i];
      int k = (n-1)/(n-phi(n));
      cout<<"\t: "<<factors(v[i])<<": "<<v[i]<<endl;
    }
  }

  return 0;
}
